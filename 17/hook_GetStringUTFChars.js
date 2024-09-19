function hook_GetStringUTFChars() {
    var GetStringUTFChars_addr = null;

    // jni 系统函数都在 libart.so 中
    var module_libart = Process.findModuleByName("libart.so");
    var symbols = module_libart.enumerateSymbols();
    for (var i = 0; i < symbols.length; i++) {
        var name = symbols[i].name;
        if ((name.indexOf("JNI") >= 0) 
            && (name.indexOf("CheckJNI") == -1) 
            && (name.indexOf("art") >= 0)) {
            if (name.indexOf("GetStringUTFChars") >= 0) {
                // 获取到指定 jni 方法地址
                GetStringUTFChars_addr = symbols[i].address;
            }
        }
    }

    Java.perform(function(){
        Interceptor.attach(GetStringUTFChars_addr, {
            onEnter: function(args){


            }, onLeave: function(retval){
                // retval const char*
				console.log("GetStringUTFChars onLeave : ", ptr(retval).readCString());
				if(ptr(retval).readCString().indexOf("普通") >=0){
					console.log("GetStringUTFChars onLeave : ", ptr(retval).readCString());
					console.log(Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n') + '\n');
				}

            }
        })
    })
}
function main(){
    Java.perform(function(){
        hook_GetStringUTFChars();
    });
} 
setImmediate(main);