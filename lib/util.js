exports.format_date = function(date,friendly) {
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    
    if(friendly){
        var now = new Date();
        var mseconds = -(date.getTime()-now.getTime());
        var time_std = [1000,60*1000,60*60*1000,24*60*60*1000];
        if(mseconds < time_std[3]) {
            if(mseconds > 0 && mseconds < time_std[1]) {
                return Math.floor(mseconds/time_std[0]).toString() + ' 秒前';
            }
            if(mseconds > time_std[1] && mseconds < time_std[2]) {
                return Math.floor(mseconds/time_std[1]).toString() + ' 分钟前';
            }
            if(mseconds > time_std[2]) {
                return Math.floor(mseconds/time_std[2]).toString() + ' 小时前';
            }
        }
    }
    
    hour = ((hour < 10) ? '0' : '') +hour;
    minute = ((minute < 10) ? '0' : '') + minute;
    second = ((second < 10) ? '0': '') +second;
    
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
};

exports.row2table = function rows2table(rows) {
    var res = {
        columns : [],
        data : []
    };

    var fnode = rows[0];

    if (fnode) {
        var key;
        for (key in fnode) {
            res.columns.push(key);
        }
        var ele;
        var data = res.data;
        var len = rows.length, i = 0;
        while (i < len) {
            fnode = rows[i];
            ele = [];
            for (key in fnode) {
                ele.push(fnode[key]);
            }
            data.push(ele);
            i++;
        }
    }
    return res;
};

var clone = function(obj) {
    if(obj == null || typeof(obj) != 'object') {
        return obj;
    }

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        temp[key] = clone(obj[key]);
    }
    return temp;
};