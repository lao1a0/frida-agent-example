from fastapi import FastAPI
from fastapi.responses import JSONResponse
import frida,sys
import uvicorn
app = FastAPI()
@app.get("/download-images/")
def download_images():
    def on_message(message, data):
        message_type = message['type']
        if message_type == 'send':
            print('[* message]', message['payload'])

        elif message_type == 'error':
            stack = message['stack']
            print('[* error]', stack)

        else:
            print(message)

    jsCode = """
    function hookTest(){
        var result = [];
        Java.perform(function(){
            Java.choose("com.zj.wuaipojie.ui.ChallengeNinth",{    //要hook的类
                onMatch:function(instance){
                    instance.setupScrollListener(); //要hook的方法
                },
                onComplete:function(){
                }
            });
            
            Java.choose("com.zj.wuaipojie.entity.ImageEntity",{    //要hook的类
                onMatch:function(instance){
                    var name = instance.getName();
                    var cover = instance.getCover();
                    // 将结果对象（包含 name 和 cover）添加到结果数组
                    result.push({name: name, cover: cover});
                },
                onComplete:function(){

                }
            });
            
        });
        return result;
    }
    rpc.exports = {
        getinfo: hookTest
    };
    """


    # 调用frida脚本
    process = frida.get_usb_device().attach("com.zj.wuaipojie")
    script = process.create_script(jsCode)
    script.on("message", on_message)  # 输出 打印
    script.load()
    getcovers = script.exports.getinfo()
    print(getcovers)

    return JSONResponse(content=getcovers)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
