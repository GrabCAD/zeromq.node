cmd_Release/obj.target/zmq.node := flock ./Release/linker.lock g++ -shared -pthread -rdynamic -m64  -Wl,-soname=zmq.node -o Release/obj.target/zmq.node -Wl,--start-group Release/obj.target/zmq/binding.o -Wl,--end-group -lzmq
