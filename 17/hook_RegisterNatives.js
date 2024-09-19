function find_RegisterNatives(params) {
    // 在 libart.so 库中枚举所有符号（函数、变量等）
    let symbols = Module.enumerateSymbolsSync("libart.so");  
    let addrRegisterNatives = null; // 用于存储 RegisterNatives 方法的地址

    // 遍历所有符号来查找 RegisterNatives 方法
    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i]; // 当前遍历到的符号

        // 检查符号名称是否符合 RegisterNatives 方法的特征
        if (symbol.name.indexOf("art") >= 0 && //RegisterNatives 是 ART（Android Runtime）环境的一部分
                symbol.name.indexOf("JNI") >= 0 &&  //RegisterNatives 是 JNI（Java Native Interface）的一部分
                symbol.name.indexOf("RegisterNatives") >= 0 && //检查符号名称中是否包含 "RegisterNatives" 字样。
		symbol.name.indexOf("CheckJNI") < 0) { //CheckJNI 是用于调试和验证 JNI 调用的工具，如果不过滤，会有两个RegisterNatives，而带有CheckJNI的系统一般是关闭的，所有要过滤掉
            addrRegisterNatives = symbol.address; // 保存方法地址
            console.log("RegisterNatives is at ", symbol.address, symbol.name); // 输出地址和名称
            hook_RegisterNatives(addrRegisterNatives); // 调用hook函数
        }
    }
}


function hook_RegisterNatives(addrRegisterNatives) {
    // 确保提供的地址不为空
    if (addrRegisterNatives != null) {
        // 使用 Frida 的 Interceptor hook指定地址的函数
        Interceptor.attach(addrRegisterNatives, {
            // 当函数被调用时执行的代码
            onEnter: function (args) {
                // 打印调用方法的数量
                console.log("[RegisterNatives] method_count:", args[3]);

                // 获取 Java 类并打印类名
                let java_class = args[1];
                let class_name = Java.vm.tryGetEnv().getClassName(java_class);
                
                let methods_ptr = ptr(args[2]); // 获取方法数组的指针
                let method_count = parseInt(args[3]); // 获取方法数量

                // 遍历所有方法
				//jni方法里包含三个部分：方法名指针、方法签名指针和方法函数指针。每个指针在内存中占用 Process.pointerSize 的空间（这是因为在 32 位系统中指针大小是 4 字节，在 64 位系统中是 8 字节）。为了提高兼容性，统一用Process.pointerSize，系统会自动根据架构来适配
                for (let i = 0; i < method_count; i++) {
                    // 读取方法的名称、签名和函数指针
                    let name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3));//读取方法名的指针。这是每个方法结构体的第一部分，所以直接从起始地址读取。
                    let sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize));//读取方法签名的指针。这是结构体的第二部分，所以在起始地址的基础上增加了一个指针的大小
                    let fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize * 3 + Process.pointerSize * 2));//读取方法函数的指针。这是结构体的第三部分，所以在起始地址的基础上增加了两个指针的大小（Process.pointerSize * 2）。

                    // 将指针内容转换为字符串
                    let name = Memory.readCString(name_ptr);
                    let sig = Memory.readCString(sig_ptr);

                    // 获取方法的调试符号
                    let symbol = DebugSymbol.fromAddress(fnPtr_ptr);

                    // 打印每个注册的方法的相关信息
                    console.log("[RegisterNatives] java_class:", class_name, "name:", name, "sig:", sig, "fnPtr:", fnPtr_ptr,  " fnOffset:", symbol, " callee:", DebugSymbol.fromAddress(this.returnAddress));
                }
            }
        });
    }
}

setImmediate(find_RegisterNatives); // 立即执行 find_RegisterNatives 函数

