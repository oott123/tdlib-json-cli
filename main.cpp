#include <iostream>
#include <string>
#include <thread>
#include "td/td/telegram/td_json_client.h"

int should_stop = 0;
void* client;

void proc_thread_input();
void proc_thread_output();

int main(int argc, char const *argv[])
{
    std::cerr << "Creating td_json client ..." << std::endl;
    client = td_json_client_create();
    std::thread thread_input(proc_thread_input);
    std::thread thread_output(proc_thread_output);
    std::cout << "true" << std::endl;
    thread_input.join();
    std::cerr << "Exiting output thread ..." << std::endl;
    should_stop = 1;
    thread_output.join();
    std::cerr << "Cleaning up ..." << std::endl;
    td_json_client_destroy(client);
    return 0;
}

void proc_thread_input() {
    std::cerr << "Input thread started!" << std::endl;
    std::string input;
    while (true) {
        getline(std::cin, input);
        if (input == "exit") {
            break;
        }
        td_json_client_send(client, input.c_str());
    }
}

void proc_thread_output() {
    std::cerr << "Output thread started!" << std::endl;
    const char* output;
    while (should_stop == 0) {
        output = td_json_client_receive(client, 1);
        if (output != NULL) {
            std::cout << output << std::endl;
        }
    }
}
