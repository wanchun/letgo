import { parse } from 'acorn';

export function genDependenceCodeId(code: string) {
    // s 标识：允许 . 匹配换行符
    console.log(parse('query.value + hello', { ecmaVersion: 2020 }).body[0].expression);
    // const result = new Set();
    // let match;
    // // eslint-disable-next-line no-cond-assign
    // while ((match = regex.exec(code)) !== null)
    //     result.add(match[1]);

    // return Array.from(result);
}
