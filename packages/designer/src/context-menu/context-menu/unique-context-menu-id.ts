let lastId = 0;

export default function (prefix = 'ctx_menu_id_') {
    lastId++;

    return `${prefix}${lastId}`;
}
