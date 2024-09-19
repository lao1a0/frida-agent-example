function replaceKILL() {
    // 查找libc.so库中kill函数的地址
    var kill_addr = Module.findExportByName("libc.so", "kill");
    // 使用Interceptor.replace来替换kill函数
    Interceptor.replace(kill_addr, new NativeCallback(function (arg0, arg1) {
        // 当kill函数被调用时，打印第一个参数（通常是进程ID）
        console.log("arg0=> ", arg0);
        // 打印第二个参数（通常是发送的信号）
        console.log("arg1=> ", arg1);
        // 打印调用kill函数的堆栈跟踪信息
        console.log('libc.so!kill called from:\n' +
            Thread.backtrace(this.context, Backtracer.ACCURATE)
                .map(DebugSymbol.fromAddress).join('\n') + '\n');
    }, "int", ["int", "int"]))
}


function hook_pthread_create() {
    //hook反调试
    var pthread_create_addr = Module.findExportByName("libc.so", "pthread_create");
    console.log("pthread_create_addr: ", pthread_create_addr);
    Interceptor.attach(pthread_create_addr, {
        onEnter: function (args) {
            console.log(args[0], args[1], args[2], args[4]);
        }, onLeave: function (retval) {
            console.log("retval is =>", retval)
        }
    })
}

function hook_strcmp() {
    var pt_strcmp = Module.findExportByName("libc.so", 'strcmp');
    Interceptor.attach(pt_strcmp, {
        onEnter: function (args) {
            var str1 = args[0].readCString(); // 原先用于比对的字符串
            var str2 = args[1].readCString(); // 用户输入的字符串
            if (str2.indexOf("hh") !== -1) {
                console.log("strcmp-->", str1, str2);
                this.printStack = true;
            }
        }, onLeave: function (retval) {
            if (this.printStack) {
                var stack = Thread.backtrace(this.context, Backtracer.ACCURATE)
                    .map(DebugSymbol.fromAddress).join("\n");
                console.log("Stack trace:\n" + stack);
            }
        }
    })
}


function hook_dlsym() {
    var dlsymAddr = Module.findExportByName("libdl.so", "dlsym");
    Interceptor.attach(dlsymAddr, {
        onEnter: function (args) {
            this.args1 = args[1];
        },
        onLeave: function (retval) {
            var module = Process.findModuleByAddress(retval);
            if (module === null) return;
            console.log(this.args1.readCString(), module.name, retval, retval.sub(module.base));
        }
    });
}

function get_url() {
    let ChallengeNinth = Java.use("com.zj.wuaipojie.ui.ChallengeNinth");
    ChallengeNinth["updateUI"].implementation = function (list) {
        let ret = this.updateUI(list);
        // 获取List的大小
        var size = list.size();
        // 遍历并打印List中的每个ImageEntity对象
        for (var i = 0; i < size; i++) {
            var imageEntity = Java.cast(list.get(i), Java.use('com.zj.wuaipojie.entity.ImageEntity'));
            console.log(imageEntity.name.value + imageEntity.cover.value);
        }
        return ret;
    };
}
function main() {
    Java.perform(function () {
        get_url();
    });
}
setImmediate(main);