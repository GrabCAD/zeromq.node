cmd_Release/zmq.node := ./gyp-mac-tool flock ./Release/linker.lock c++ -bundle -Wl,-search_paths_first -mmacosx-version-min=10.5 -arch x86_64 -L./Release  -o Release/zmq.node Release/obj.target/zmq/binding.o -undefined dynamic_lookup -lzmq -L/usr/local/Cellar/zeromq/4.0.5_2/lib -L/opt/local/lib -L/usr/local/lib