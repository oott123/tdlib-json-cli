cmake_minimum_required(VERSION 3.1 FATAL_ERROR)

project(TdlibJsonCli VERSION 1.0 LANGUAGES CXX)

add_subdirectory(td)

add_executable(tdlib_json_cli main.cpp)
target_link_libraries(tdlib_json_cli Td::TdJsonStatic)
set_property(TARGET tdlib_json_cli PROPERTY CXX_STANDARD 11)
set_target_properties(tdlib_json_cli
    PROPERTIES
    ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
)
