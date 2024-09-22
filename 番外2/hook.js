function hookTest1() {
    var ClassName = Java.use("com.zj.wuaipojie2024_1.YSQDActivity");
    console.log(ClassName.extractDataFromFile("/data/user/0/com.zj.wuaipojie2024_1/files/ys.mp4"));
}

function hookTest2() {
    var Arrays = Java.use("java.util.Arrays");
    Java.choose("com.kbtx.redpack_simple.WishActivity", {
        onMatch: function (obj) {
            console.log("obj的值: " + obj);
            var oAsString = Arrays.toString(obj.o.value);
            console.log("o字段的值: " + oAsString);
            obj.o.value = Java.array('I', [90, 90, 122]);
        },
        onComplete: function () {

        }
    });
}
function hook_delete() {
    Java.perform(function () {
        // 获取java.io.File类的引用
        var File = Java.use("java.io.File");
        // 挂钩delete方法
        File.delete.implementation = function () {
            // 打印尝试删除的文件路径
            console.log(this.ClassName);
            console.log("Deleting file: " + this.getPath());
            return true;
        };
    });
}

function hook_resources() {
    Java.perform(function () {
        // 获取android.content.res.Resources类的引用
        var Resources = Java.use("android.content.res.Resources");
        // 挂钩getIntArray方法
        Resources.getIntArray.overload('int').implementation = function (id) {
            // 换成b方法的偏移
            var replacementArray = Java.array('int', [0, 3, 8108]);
            // 打印新的返回值
            console.log("Replacing getIntArray result with: " + JSON.stringify(replacementArray));
            // 返回新的数组替代原始的返回值
            return replacementArray;
        };
    });

}

function main() {
    Java.perform(function () {
        hook_delete();
        hook_resources();
    });
}
setImmediate(main);
