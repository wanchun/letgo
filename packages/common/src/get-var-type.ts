export function getVarType(o: any): string {
    let typeStr = (Object.prototype.toString.call(o).match(/\[object (.*?)\]/) || [])[1];
    // 增加自定义类型获取
    if (typeStr === 'Object') {
        typeStr += `:${o.constructor.name}`;
    }
    else if (typeStr === 'Number') {
        // 判断为非数字 , NaN，Infinity
        if (!isFinite(o)) {
            // 判断为NaN类型
            typeStr = isNaN(o) ? 'NaN' : 'Infinity';
        }
    }
    return typeStr;
}
