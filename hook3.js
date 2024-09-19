
function hookTest1() {
    Java.perform(function () {
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so", "Java_com_zj_wuaipojie_util_SecurityUtil_vipLevel");
        if (helloAddr != null) {
            Interceptor.attach(helloAddr, {
                //onEnter里可以打印和修改参数
                onEnter: function (args) {  //args传入参数
                    console.log("*".repeat(50));
                    var JNIEnv = Java.vm.getEnv();
                    var originalStrPtr = JNIEnv.getStringUtfChars(args[2], null).readCString();
                    console.log("参数:", originalStrPtr);
                    var modifiedContent = "至尊";
                    var newJString = JNIEnv.newStringUtf(modifiedContent);
                    args[2] = newJString;
                    console.log("修改后的参数:", JNIEnv.getStringUtfChars(args[2], null).readCString());
                },
                //onLeave里可以打印和修改返回值
                onLeave: function (retval) {  //retval返回值
                    var returnedJString = Java.cast(retval, Java.use('java.lang.String'));
                    console.log("返回值:", returnedJString.toString());

                    //一般写在app的私有目录里，不然会报错:failed to open file (Permission denied)(实际上就是权限不足)
                    var file_path = "/data/user/0/com.zj.wuaipojie/test.txt";
                    var file_handle = new File(file_path, "wb");
                    if (file_handle && file_handle != null) {
                        file_handle.write(returnedJString.toString()); //写入数据
                        console.log("写入成功");
                        file_handle.flush(); //刷新
                        file_handle.close(); //关闭
                    }
                }
            })
        }
    })
}

function inline_hook() {
    var soAddr = Module.findBaseAddress("lib52pojie.so");
    if (soAddr) {
        var func_addr = soAddr.add(0x10428); // 调试的是check函数
        Java.perform(function () {
            Interceptor.attach(func_addr, {
                onEnter: function (args) {
                    // console.log(JSON.stringify(this.context));
                    console.log(this.context.x22); //注意此时就没有args概念了，修改w22寄存器的值
                    this.context.x22 = ptr(1); //赋值方法参考上一节课，指针赋值法
                    console.log(this.context.x22);
                },
                onLeave: function (retval) {
                }
            }
            )
        })
    }
}

function hookTest2() {
    var soAddr = Module.findBaseAddress("lib52pojie.so");
    var codeAddr = soAddr.add(0x10428);
    Memory.patchCode(codeAddr, 4, function (code) {
        const writer = new Arm64Writer(code, { pc: codeAddr });
        writer.putBytes(hexToBytes("20008052")); //通过汇编来修改
        writer.flush();
    });
}
function hexToBytes(str) {
    var pos = 0;
    var len = str.length;
    if (len % 2 != 0) {
        return null;
    }
    len /= 2;
    var hexA = new Array();
    for (var i = 0; i < len; i++) {
        var s = str.substr(pos, 2);
        var v = parseInt(s, 16);
        hexA.push(v);
        pos += 2;
    }
    return hexA;
}

function hookTest3() {
    var funcAddr = Module.findExportByName("lib52pojie.so", "AES_ECB_PKCS7_Decrypt");
    // var funcAddr = Module.findBaseAddress("lib52pojie.so").add(0xE85C);// 找到对应的偏移
    //声明函数指针
    //NativeFunction的第一个参数是地址，第二个参数是返回值类型，第三个[]里的是传入的参数类型(有几个就填几个)
    var aesAddr = new NativeFunction(funcAddr, 'pointer', ['pointer', 'pointer']);
    var encry_text = Memory.allocUtf8String("OOmGYpk6s0qPSXEPp4X31g==");    //开辟一个指针存放字符串       
    var key = Memory.allocUtf8String('wuaipojie0123456');
    console.log(aesAddr(encry_text, key).readCString());

}
function main() {
    Java.perform(function () {
        hookTest3();
    });
}
setImmediate(main);
