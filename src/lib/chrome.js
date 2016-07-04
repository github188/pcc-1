/**
 * Created by JZ on 2015/9/25.
 */
(function (_) {
    var reg = /msie\s([\d]+)[\.\d]+/,
        userAgent = _.navigator.userAgent.toLowerCase(),
        list = reg.exec(userAgent),
        version = list && list[1];      
        
    if (version && version < 9 ) {
        _.location.href = "./chrome.html";
    }

})(this);