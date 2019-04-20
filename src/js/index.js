$(function () {
 /*   轮播图*/
    var count = 0;
    $(".arrow-right").click(function () {
        count++;
        if(count == $(".ui-wapper li").length){
            count = 0;
        }
        //让count渐渐的显示，其他兄弟渐渐的隐藏
        $(".ui-wapper li").eq(count).fadeIn().siblings("li").fadeOut();
    });

    $(".arrow-left").click(function () {
        count--;
        if(count == -1){
            count = $(".ui-wapper li").length - 1;
        }
        //让count渐渐的显示，其他兄弟渐渐的隐藏
        $(".ui-wapper li").eq(count).fadeIn().siblings("li").fadeOut();
    });

    $(".ui-pager-item").on("click",function(){
            $(this).addClass("active");
            $(this).siblings().removeClass("active");
            let index=$(this).index()
       if(index==$(".ui-wapper li").length-1)
          index=0;

        $(".ui-wapper li").eq(index).fadeIn().siblings("li").fadeOut();


        /*setInterval(function change() {
            $(".ui-wapper li").addClass("active");
            $(".ui-wapper li").siblings().removeClass("active");
            let index=$(".ui-wapper li").index()
            if(index == $(".ui-wapper li").length-1)
                index=0;
            $(".ui-wapper li").eq(index).stop().fadeIn().siblings("li").stop().fadeOut();
console.log("ok");
        },1000)*/

    });



});