import type { IPublicTypeRootSchema } from '@fesjs/letgo-types';

export const schema: IPublicTypeRootSchema = {
    componentName: 'Page',
    id: 'node_dockcviv8fo1',
    props: {
        ref: 'outerView',
        style: {
            height: '100%',
        },
    },
    fileName: '/',
    css: 'body {\n  font-size: 12px;\n}\n\n.button {\n  width: 100px;\n  color: #ff00ff\n}',
    children: [
        {
            componentName: 'FSpace',
            props: {
                justify: 'center',
            },
            children: [
                {
                    componentName: 'FForm',
                    props: {
                        labelWidth: 120,
                        labelPosition: 'right',
                        style: {
                            width: '400px',
                            marginTop: '40px',
                        },
                    },
                    condition: true,
                    children: [
                        {
                            componentName: 'FFormItem',
                            props: {
                                label: '持卡人：',
                                prop: 'name',
                            },
                            condition: true,
                            children: [
                                {
                                    componentName: 'FInput',
                                    props: {
                                        placeholder: '请输入持卡人姓名',
                                    },
                                    condition: true,
                                },
                            ],
                        },
                        {
                            componentName: 'FFormItem',
                            props: {
                                label: '储蓄卡号：',
                                prop: 'bankNo',
                            },
                            condition: true,
                            children: [
                                {
                                    componentName: 'FInput',
                                    props: {
                                        placeholder: '请输入储蓄卡号',
                                    },
                                    condition: true,
                                },
                            ],
                        },
                        {
                            componentName: 'FFormItem',
                            props: {
                                label: '银行：',
                                prop: 'bankName',
                            },
                            condition: true,
                            children: [
                                {
                                    componentName: 'FSelect',
                                    props: {
                                        placeholder: '请选择储蓄卡所属银行',
                                        options: [
                                            {
                                                label: '招商银行',
                                                value: '1',
                                            },
                                            {
                                                label: '工商银行',
                                                value: '2',
                                            },
                                            {
                                                label: '建设银行',
                                                value: '2',
                                            },
                                        ],
                                        clearable: true,
                                        filterable: true,
                                    },
                                    condition: true,
                                },
                            ],
                        },
                        {
                            componentName: 'FFormItem',
                            props: {
                                label: '手机号：',
                                prop: 'phone',
                            },
                            condition: true,
                            children: [
                                {
                                    componentName: 'FInput',
                                    props: {
                                        placeholder: '请输入手机号',
                                    },
                                    condition: true,
                                },
                            ],
                        },
                        {
                            componentName: 'FFormItem',
                            props: {
                                label: '验证码：',
                                prop: 'messageCode',
                            },
                            condition: true,
                            children: [
                                {
                                    componentName: 'FInput',
                                    props: {
                                        placeholder: '请输入短信验证码',
                                        suffix: {
                                            type: 'JSSlot',
                                            name: 'suffix',
                                            title: '前缀',
                                            value: {
                                                componentName: 'FButton',
                                                props: {
                                                    type: 'link',
                                                    children: '获取验证码',
                                                },
                                            },
                                        },
                                    },
                                    condition: true,
                                    children: [

                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        // {
        //     componentName: 'FForm',
        //     id: 'node_oclhaa5ved2',
        //     props: {
        //         ref: 'form_hnur',
        //         layout: 'inline',
        //     },
        //     condition: true,
        //     children: [
        //         {
        //             componentName: 'FFormItem',
        //             id: 'node_oclhaa5ved5',
        //             props: {
        //                 label: '姓名',
        //                 name: 'name',
        //             },
        //             condition: true,
        //             children: [
        //                 {
        //                     componentName: 'FInput',
        //                     id: 'node_oclhaa5ved6',
        //                     props: {
        //                         placeholder: '请输入',
        //                     },
        //                     condition: true,
        //                 },
        //             ],
        //         },
        //         {
        //             componentName: 'FFormItem',
        //             id: 'node_oclhaa5vedb',
        //             props: {
        //                 label: '性别',
        //             },
        //             condition: true,
        //             children: [
        //                 {
        //                     componentName: 'FSelect',
        //                     id: 'node_oclhaa5vedc',
        //                     props: {
        //                         placeholder: '请选择',
        //                         options: [
        //                             {
        //                                 label: '男',
        //                                 value: '1',
        //                             },
        //                             {
        //                                 label: '女',
        //                                 value: '2',
        //                             },
        //                         ],
        //                         clearable: true,
        //                     },
        //                     condition: true,
        //                 },
        //             ],
        //         },
        //         {
        //             componentName: 'FFormItem',
        //             id: 'node_oclhaa5vedn',
        //             props: {
        //                 label: ' ',
        //             },
        //             condition: true,
        //             children: [
        //                 {
        //                     componentName: 'FButton',
        //                     id: 'node_oclhaa5vedo',
        //                     props: {
        //                         type: 'primary',
        //                         children: '提交',
        //                         htmlType: 'submit',
        //                     },
        //                     condition: true,
        //                 },
        //                 {
        //                     componentName: 'FButton',
        //                     id: 'node_oclhaa5vedp',
        //                     props: {
        //                         style: {
        //                             marginLeft: '12px',
        //                         },
        //                         children: '取消',
        //                     },
        //                     condition: true,
        //                 },
        //             ],
        //         },
        //     ],
        // },
        // {
        //     componentName: 'FTable',
        //     id: 'node_oclhaa5vedq',
        //     props: {
        //         data: [
        //             {
        //                 id: '1',
        //                 name: '胡彦斌',
        //                 age: 32,
        //                 sex: '1',
        //                 address: '西湖区湖底公园1号',
        //             },
        //             {
        //                 id: '2',
        //                 name: '王一博',
        //                 age: 28,
        //                 sex: '1',
        //                 address: '滨江区网商路699号',
        //             },
        //             {
        //                 id: '3',
        //                 name: '凌志玲',
        //                 age: 35,
        //                 sex: '2',
        //                 address: '深圳南山区',
        //             },
        //         ],
        //         columns: [
        //             {
        //                 label: '姓名',
        //                 prop: 'name',
        //             },
        //             {
        //                 label: '性别',
        //                 prop: 'sex',
        //             },
        //             {
        //                 label: '年龄',
        //                 prop: 'age',
        //             },
        //             {
        //                 label: '地址',
        //                 prop: 'address',
        //             },
        //         ],
        //         rowKey: 'id',
        //         style: {
        //             marginTop: '40px',
        //         },
        //     },
        //     condition: true,
        // },
    ],
};
