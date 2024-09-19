
//定义一个名为hookTest1的函数
function hookTest1() {
    //获取一个名为"类名"的Java类，并将其实例赋值给JavaScript变量utils
    var utils = Java.use("com.zj.wuaipojie.Demo");
    //修改"类名"的"method"方法的实现。这个新的实现会接收两个参数（a和b）
    utils.a.implementation = function (str) {
        //将参数a和b的值改为123和456。
        // a = 123;
        // b = 456;
        //调用修改过的"method"方法，并将返回值存储在`retval`变量中
        var retval = this.a(str);
        //在控制台上打印参数a，b的值以及"method"方法的返回值
        str = "laolao"
        console.log(str, retval);
        //返回"method"方法的返回值
        return str;
    }
}


// .overload()
// .overload('自定义参数')
// .overload('int')
function hookTest2() {
    var utils = Java.use("com.zj.wuaipojie.Demo");
    //overload定义重载函数，根据函数的参数类型填
    utils.Inner.overload('com.zj.wuaipojie.Demo$Animal', 'java.lang.String').implementation = function (a, str) {
        // b = "aaaaaaaaaa";
        this.Inner(a, str);
        console.log(str);
    }
}

function hookTest3() {
    var utils = Java.use("com.zj.wuaipojie.Demo");
    //修改类的构造函数的实现，$init表示构造函数
    utils.$init.overload('java.lang.String').implementation = function (str) {
        console.log(str);
        str = "52";
        this.$init(str);
    }
}

function hookTest4() {
    Java.perform(function () {
        //静态字段的修改
        var utils = Java.use("com.zj.wuaipojie.Demo");
        //修改类的静态字段"flag"的值
        utils.staticField.value = "我是被修改的静态变量";
        console.log(utils.staticField.value);
    });
}


// function hookTest5() {
//     Java.perform(function () {
//         //非静态字段的修改
//         //使用`Java.choose()`枚举类的所有实例
//         Java.choose("com.zj.wuaipojie.Demo", {
//             onMatch: function (obj) {
//                 //修改实例的非静态字段"_privateInt"的值为"123456"，并修改非静态字段"privateInt"的值为9999。
//                 // obj._privateInt.value = "123456"; //字段名与函数名相同 前面加个下划线
//                 console.log(obj.publicInt.value);
//                 obj.privateInt.value = 1234678;
//                 console.log(obj.publicInt.value);
//             },
//             onComplete: function (obj) {

//             }
//         });
//     });
// }
/**
 * https://www.52pojie.cn/thread-1823118-1-1.html#:~:text=ItemTouchHelper.Callback.D%20...-,%E6%AD%A3%E8%80%81%E5%B8%88%EF%BC%8C%E6%88%91%E7%BB%88%E4%BA%8E%E6%89%BE%E5%88%B0%E5%8E%9F%E5%9B%A0%E4%BA%86%EF%BC%8C%E4%BD%A0%E7%9C%8B%E5%AF%B9%E7%9D%80%E6%B2%A1%EF%BC%81,-1.%20logcat%E7%9C%8B%E4%B8%8D%E5%88%B0
 */
function hookTest5(){
    Java.perform(function(){
        //非静态字段的修改
        //使用`Java.choose()`枚举类的所有实例
        Java.choose("com.zj.wuaipojie.Demo", {
            onMatch: function(obj){
                //修改实例的非静态字段"_privateInt"的值为"123456"，并修改非静态字段"privateInt"的值为9999。
                // obj._privateInt.value = "123456"; //字段名与函数名相同时 前面加个下划线
                console.log("here!")
                obj.publicInt.value = 8888;
                obj.privateInt.value = 9999;
                //由于样本代码的原因，需要再主动调用一下Demo类日志输出函数test()，才能在adb的log界面看到输出改变
                obj.test();
                console.log(obj.privateInt.value )
            },
            onComplete: function(){

            }
        });
    });
}


function hookTest6() {
    Java.perform(function () {
        //内部类
        var innerClass = Java.use("com.zj.wuaipojie.Demo$InnerClass");
        console.log(innerClass);
        console.log(innerClass.$init.implementation);
        innerClass.$init.implementation = function () {
            console.log("eeeeeeee");
        }

    });
}


/**
 * hookTest7函数用于枚举并处理指定类及其方法
 * 该函数主要通过Java.perform来异步枚举加载的类，然后过滤出特定的类，
 * 再进一步获取并打印该类的所有方法
 */
function hookTest7() {
    Java.perform(function () {
        //枚举所有的类与类的所有方法,异步枚举
        Java.enumerateLoadedClasses({
            onMatch: function (name, handle) {
                //过滤类名
                if (name.indexOf("com.zj.wuaipojie.Demo") != -1) {
                    console.log(name);
                    var clazz = Java.use(name);
                    console.log(clazz);
                    var methods = clazz.class.getDeclaredMethods();
                    console.log(methods);
                }
            },
            onComplete: function () { }
        })
    })
}


function hookTest8() {
    Java.perform(function () {
        var Demo = Java.use("com.zj.wuaipojie.Demo");
        //getDeclaredMethods枚举所有方法
        var methods = Demo.class.getDeclaredMethods();
        for (var j = 0; j < methods.length; j++) {
            var methodName = methods[j].getName();
            console.log(methodName);
            for (var k = 0; k < Demo[methodName].overloads.length; k++) {
                Demo[methodName].overloads[k].implementation = function () {
                    for (var i = 0; i < arguments.length; i++) {
                        console.log(arguments[i]);
                    }
                    return this[methodName].apply(this, arguments);
                }
            }
        }
    })
}

function hookTest9() {
    Java.perform(function () {
        var ret = null;
        Java.choose("com.zj.wuaipojie.Demo", {    //要hook的类
            onMatch: function (instance) {
                ret = instance.privateFunc("aaaaaaa"); //要hook的方法
            },
            onComplete: function () {
                //console.log("result: " + ret);
            }
        });
    })
    //return ret;
}

function hookTest10() {
    Java.perform(function () {
        var ClassName = Java.use("com.zj.wuaipojie.Encode");
        var ret = ClassName.encode("laolaolao");
        console.log(ret);
    });
}
function main() {
    hookTest9();
}
setImmediate(main);
