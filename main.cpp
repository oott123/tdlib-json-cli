#include <iostream>
#include <string>
#include <thread>
#include "td/td/telegram/td_json_client.h"
#include "td/td/telegram/Log.h"

void* client;
int should_stop = 0;

void proc_thread_input();
void proc_thread_output();
void trigger_cli_event(std::string);
void set_verbosity(char const *);

int main(int argc, char const *argv[])
{
    set_verbosity(argv[1]);
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
            set_verbosity(input.substr(7).c_str());
            continue;
        }
        td_json_client_send(client, input.c_str());
    }
}

void proc_thread_output() {
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

void set_verbosity(char const *argv) {
    if (argv == NULL) return;
    auto level = atoi(argv);
    td::Log::set_verbosity_level(level);
    trigger_cli_event("verbosity_set");
}
