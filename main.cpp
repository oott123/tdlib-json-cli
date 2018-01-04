#include <iostream>
#include <string>
#include <thread>
#include "td/td/telegram/td_json_client.h"
#include "td/td/telegram/td_log.h"

void* client;
int should_stop = 0;

void proc_thread_input();
void proc_thread_output();
void trigger_cli_event(std::string);

int main(int argc, char const *argv[])
{
    client = td_json_client_create();
    trigger_cli_event("client_created");
    std::thread thread_input(proc_thread_input);
    std::thread thread_output(proc_thread_output);
    thread_input.join();
    should_stop = 1;
    thread_output.join();
    trigger_cli_event("exited");
    return 0;
}

void proc_thread_input() {
    trigger_cli_event("input_thread_started");
    std::string input;
    while (std::cin) {
        getline(std::cin, input);
        if (input == "exit") {
            break;
        }
        if (input.empty()) {
            continue;
        }
        if (input.rfind("verbose ", 0) == 0) {
            // verbose<space>
            // 01234567
            auto level = atoi(input.substr(7).c_str());
            td_set_log_verbosity_level(level);
            continue;
        }
        td_json_client_send(client, input.c_str());
    }
}

void proc_thread_output() {
    trigger_cli_event("output_thread_started");
    const char* output;
    while (should_stop == 0) {
        output = td_json_client_receive(client, 1);
        if (output != NULL) {
            std::cout << output << std::endl;
        }
    }
}

void trigger_cli_event(std::string event_name) {
    std::cout << "{\"@cli\":{\"event\":\"" << event_name << "\"}}" << std::endl;
}
