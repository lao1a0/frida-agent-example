function hookTest1() {
    let SecurityUtil = Java.use("com.zj.wuaipojie.util.SecurityUtil");
    SecurityUtil["checkVip"].implementation = function () {
        console.log('checkVip is called');
        let result = this.checkVip();
        console.log('checkVIP ret value is ' + result);
        return result;
    };
}
function hookTest2() {
    /**
     * 布尔类型的修改
     */
    Java.perform(function () {
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so", "Java_com_zj_wuaipojie_util_SecurityUtil_checkVip");
        console.log(helloAddr);
        if (helloAddr != null) {
            //Interceptor.attach是Frida里的一个拦截器
            Interceptor.attach(helloAddr, {
                //onEnter里可以打印和修改参数
                onEnter: function (args) {  //args传入参数
                },
                //onLeave里可以打印和修改返回值
                onLeave: function (retval) {  //retval返回值
                    console.log(retval);
                    retval.replace(0x1);
                }
            })
        }
    })
}
function hookTest21() {
    /**
     * int 类型的修改-jadex实现
     */
    let SecurityUtil = Java.use("com.zj.wuaipojie.util.SecurityUtil");
    SecurityUtil["diamondNum"].implementation = function () {
        console.log(`SecurityUtil.diamondNum is called`);
        let result = this["diamondNum"]();
        console.log(`SecurityUtil.diamondNum result=${result}`);
        result = 9999
        return result;
    };
}

function hookTest23() {
    /**
     * int 类型的修改-so实现
     */
    Java.perform(function () {
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so", "Java_com_zj_wuaipojie_util_SecurityUtil_diamondNum");
        console.log(helloAddr);
        if (helloAddr != null) {
            //Interceptor.attach是Frida里的一个拦截器
            Interceptor.attach(helloAddr, {
                //onEnter里可以打印和修改参数
                onEnter: function (args) {  //args传入参数
                },
                //onLeave里可以打印和修改返回值
                onLeave: function (retval) {  //retval返回值
                    console.log(retval);
                    retval.replace(0x1);
                }
            })
        }
    })
}

function hookTest24() {
    /**
     * String 类型的——java层进行修改
     */
    let SecurityUtil = Java.use("com.zj.wuaipojie.util.SecurityUtil");
    SecurityUtil["vipLevel"].implementation = function (str) {
        console.log(`SecurityUtil.vipLevel is called: str=${str}`);
        let result = this["vipLevel"](str);
        console.log(`SecurityUtil.vipLevel result=${result}`);
        result = "至尊会员";
        return result;
    };
}

function hookTest25() {
    /**
     * String 类型的——so实现
     */
    Java.perform(function () {
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so", "Java_com_zj_wuaipojie_util_SecurityUtil_vipLevel");
        console.log(helloAddr);
        if (helloAddr != null) {
            //Interceptor.attach是Frida里的一个拦截器
            Interceptor.attach(helloAddr, {
                //onEnter里可以打印和修改参数
                onEnter: function (args) {  //args传入参数
                    console.log(args[2]);  //打印第一个参数的值，猜测参数的类型
                    // console.log(args[1].toInt32()); //toInt32()转十进制
                    // console.log(args[2].readCString()); //读取字符串 char类型 用于c++的代码里面
                    console.log(hexdump(args[2])); //内存dump：得不到什么有用的信息
                    console.log(this.context.x1);  // 打印寄存器内容
                    console.log(hexdump(this.context.x1));  // 查看寄存器内容
                    var jString = Java.cast(args[2], Java.use('java.lang.String'));
                    console.log("参数:", jString.toString());

                },
                //onLeave里可以打印和修改返回值
                onLeave: function (retval) {  //retval返回值
                    console.log(retval);
                    var jString = Java.cast(retval, Java.use('java.lang.String'));
                    console.log("参数:", jString.toString());
                }
            })
        }
    })
}

function hookTest26() {
    /**
     * String 类型的——so实现
     */
    Java.perform(function () {
        //根据导出函数名打印地址
        var helloAddr = Module.findExportByName("lib52pojie.so", "Java_com_zj_wuaipojie_util_SecurityUtil_vipLevel");
        console.log(helloAddr);
        if (helloAddr != null) {
            //Interceptor.attach是Frida里的一个拦截器
            Interceptor.attach(helloAddr, {
                //onEnter里可以打印和修改参数
                onEnter: function (args) {  //args传入参数
                    console.log(args[2]);  //打印第一个参数的值，猜测参数的类型
                    // console.log(args[1].toInt32()); //toInt32()转十进制
                    // console.log(args[2].readCString()); //读取字符串 char类型 用于c++的代码里面
                    // console.log(hexdump(args[2])); //内存dump：得不到什么有用的信息
                    // console.log(this.context.x1);  // 打印寄存器内容
                    // console.log(hexdump(this.context.x1));  // 查看寄存器内容
                    var JNIEnv = Java.vm.getEnv();
                    var originalStrPtr = JNIEnv.getStringUtfChars(args[2], null).readCString();
                    console.log("参数:", originalStrPtr);

                },
                //onLeave里可以打印和修改返回值
                onLeave: function (retval) {  //retval返回值
                    // console.log(retval);
                    var returnedJString = Java.cast(retval, Java.use('java.lang.String'));
                    console.log("返回值:", returnedJString.toString());
                }
            })
        }
    })
}


function hookTest4() {
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
                    var JNIEnv = Java.vm.getEnv();
                    var modifiedContent = "无敌";
                    var newJString = JNIEnv.newStringUtf(modifiedContent + returnedJString);
                    retval.replace(newJString);
                    console.log("修改后的返回值:", Java.cast(retval, Java.use('java.lang.String')).toString());
                }
            })
        }
    })
}

function hookTest5() {
    Java.perform(function () {
        //打印导入表
        var imports = Module.enumerateImports("lib52pojie.so");
        for (var i = 0; i < imports.length; i++) {
            if (imports[i].name == "vip") {
                console.log(JSON.stringify(imports[i])); //通过JSON.stringify打印object数据
                console.log(imports[i].address);
            }
        }
        //打印导出表
        var exports = Module.enumerateExports("lib52pojie.so");
        for (var i = 0; i < exports.length; i++) {
            console.log(JSON.stringify(exports[i]));
        }

    })
}

function hookTest6() {
    Java.perform(function () {
        var moduleAddr1 = Process.findModuleByName("lib52pojie.so").base;
        var moduleAddr2 = Process.getModuleByName("lib52pojie.so").base;
        var moduleAddr3 = Module.findBaseAddress("lib52pojie.so");
        console.log(moduleAddr1, moduleAddr2, moduleAddr3);
    });
}

function hookTest7() {
    Java.perform(function () {
        //根据导出函数名打印基址，这里是不经过函数名进行hook而是通过计算地址的方式进行hook
        var soAddr = Module.findBaseAddress("lib52pojie.so"); // 获得so的基址
        console.log(soAddr);
        var funcaddr = soAddr.add(0x1071C); // 加上偏移得到函数的地址
        console.log(funcaddr);
        if (funcaddr != null) {
            Interceptor.attach(funcaddr, {
                onEnter: function (args) {  //args参数

                },
                onLeave: function (retval) {  //retval返回值
                    console.log(retval.toInt32());
                }
            })
        }
    })
}


function hook_dlopen() {
    var dlopen = Module.findExportByName(null, "dlopen");
    Interceptor.attach(dlopen, {
        onEnter: function (args) {
            var so_name = args[0].readCString();
            if (so_name.indexOf("lib52pojie.so") >= 0) this.call_hook = true;
        }, onLeave: function (retval) {
            if (this.call_hook) hookTest24();
        }
    });
    // 高版本Android系统使用android_dlopen_ext
    var android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
    Interceptor.attach(android_dlopen_ext, {
        onEnter: function (args) {
            var so_name = args[0].readCString();
            if (so_name.indexOf("lib52pojie.so") >= 0) this.call_hook = true;
        }, onLeave: function (retval) {
            if (this.call_hook) hookTest24();
        }
    });
}
function main() {
    hookTest26();
    // Java.perform(function () {
    //     console.log("*".repeat(50));
    //     hook_dlopen();
    // });
}
setImmediate(main);
