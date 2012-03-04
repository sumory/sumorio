

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
}