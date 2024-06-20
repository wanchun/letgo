/* eslint-disable no-template-curly-in-string */
import type { IPublicTypeRootSchema } from '@webank/letgo-engine';

const info: IPublicTypeRootSchema = {
    componentName: 'Page',
    id: 'root',
    ref: 'root',
    props: {
        style: {
            paddingTop: '20px',
            paddingBottom: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
        },
    },
    fileName: '/performanceManage/promotionInfoView',
    isLocked: false,
    condition: true,
    title: '个人晋级信息查询',
    code: {
        directories: [],
        code: [
            {
                id: 'stateMap',
                type: 'temporaryState',
                initValue: '[\n  {\n    value: 0,\n    label: \'审核中\'\n  },\n  {\n    value: 1,\n    label: \'通过\'\n  },\n  {\n    value: 2,\n    label: \'不通过\'\n  }\n]',
            },
            {
                id: 'cycleStateMap',
                type: 'temporaryState',
                initValue: '[\n    {\n        value: \'TO_BE_STARTED\',\n        label: \'未开始\',\n    },\n    {\n        value: \'TO_BE_CHECKED\',\n        label: \'待核对\',\n    },\n    {\n        value: \'CHECKING\',\n        label: \'核对中\',\n    },\n    {\n        value: \'TO_BE_ANNOUNCED\',\n        label: \'待公示\',\n    },\n    {\n        value: \'COMPLETED\',\n        label: \'已完成\',\n    },\n]',
            },
            {
                id: 'resultJudgementMap',
                type: 'temporaryState',
                initValue: '[\n    {\n        value: \'PASSED\',\n        label: \'达成\',\n    },\n    {\n        value: \'REJECTED\',\n        label: \'未达成\',\n    },\n]',
            },
            {
                id: 'promotionResultMap',
                type: 'temporaryState',
                initValue: '[\n    {\n        value: \'TO_BE_ANNOUNCED\',\n        label: \'待公示\',\n    },\n    {\n        value: \'PASSED\',\n        label: \'通过\',\n    },\n    {\n        value: \'REJECTED\',\n        label: \'未通过\',\n    },\n]',
            },
            {
                id: 'promotionRefuseFlagMap',
                type: 'temporaryState',
                initValue: '[\n    {\n        value: \'ALLOW\',\n        label: \'是\',\n    },\n    {\n        value: \'REFUSE\',\n        label: \'否\',\n    },\n]',
            },
            {
                id: 'periodMap',
                type: 'temporaryState',
                initValue: '[\n    {\n        value: \'HALF\',\n        label: \'上半年\',\n    },\n    {\n        value: \'LATER\',\n        label: \'下半年\',\n    },\n]',
            },
            {
                id: 'queryGradeList',
                resourceType: 'rest',
                type: 'query',
                runCondition: 'manual',
                query: '',
                enableCaching: false,
                queryTimeout: 10000,
                method: 'POST',
                enableTransformer: true,
                transformer: 'const { cycle } = data?.result || {};\nconst list = (cycle || []).map((item) => ({\n  label: item.gradeName,\n  value: item.gradeId,\n}));\nreturn {\n  list: [{ label: "全部", value: "" }].concat(list),\n};\n',
                api: '/hr/grade/list',
                params: '{ page: {currentPage: 1, pageSize: 999999},\nuserId: letgoContext.mainAppState.userId \n}',
                runWhenPageLoads: true,
                cacheDuration: 10,
            },
            {
                id: 'getStaffDetail',
                resourceType: 'rest',
                type: 'query',
                runCondition: 'manual',
                query: '',
                enableCaching: false,
                queryTimeout: 10000,
                method: 'POST',
                enableTransformer: true,
                transformer: 'const {\n  promotionStaffDataBaseInfo,\n  promotionQuotaValueList,\n  promotionQuotaDetailValueList,\n  promotionHistoryInfoList,\n  promotionChangeInfoList,\n  cycleType,\n} = data?.result || {};\n\nconst list1 = (promotionQuotaValueList || []).map((item, a) => ({\n  ...item,\n  resultText:\n    resultMap.value.find((option) => option.value === item.result)?.label ||\n    item.result,\n  index: a + 1,\n}));\n\nconst list2 = (promotionQuotaDetailValueList || []).map((item, b) => ({\n  ...item,\n  actual1: item.actualValue1 ? parseFloat(item.actualValue1)?.toFixed(2) : "",\n  actual2: item.actualValue2 ? parseFloat(item.actualValue2)?.toFixed(2) : "",\n  actual3: item.actualValue3 ? parseFloat(item.actualValue3)?.toFixed(2) : "",\n  actual4: item.actualValue4 ? parseFloat(item.actualValue4)?.toFixed(2) : "",\n  actual5: item.actualValue5 ? parseFloat(item.actualValue5)?.toFixed(2) : "",\n  actual6: item.actualValue6 ? parseFloat(item.actualValue6)?.toFixed(2) : "",\n  index: b + 1,\n}));\n\nconst list3 = (promotionHistoryInfoList || []).map((item, c) => ({\n  ...item,\n  periodText:\n    periodMap.value.find((option) => option.value === item.period)?.label ||\n    item.period,\n  targetText:\n    queryGradeList?.data?.list?.find(\n      (option) => option.value === item.target,\n    )?.label ||\n    item.target,\n  currentText:\n    queryGradeList?.data?.list?.find(\n      (option) => option.value === item.current,\n    )?.label ||\n    item.current,\n  promotionResultText:\n    promotionResultMap.value.find(\n      (option) => option.value === item.promotionResult,\n    )?.label ||\n    item.promotionResult,\n  index: c + 1,\n}));\n\nconst list4 = (promotionChangeInfoList || []).map((item, d) => ({\n  ...item,\n  periodText:\n    periodMap.value.find((option) => option.value === item.period)?.label ||\n    item.period,\n  createdTimeText: item.createdTime\n    ? utils.dayjs(item.createdTime).format("YYYY-MM-DD HH:mm:ss")\n    : "",\n  updatedTimeText: item.updatedTime\n    ? utils.dayjs(item.updatedTime).format("YYYY-MM-DD HH:mm:ss")\n    : "",\n  stateText:\n    stateMap.value.find((option) => option.value === item.state)?.label ||\n    item.state,\n  index: d + 1,\n}));\n\nstaffDetailObj.setIn("promotionStaffDataBaseInfo", promotionStaffDataBaseInfo);\nstaffDetailObj.setIn("promotionQuotaValueList", list1);\nstaffDetailObj.setIn("promotionQuotaDetailValueList", list2);\nstaffDetailObj.setIn("promotionHistoryInfoList", list3);\nstaffDetailObj.setIn("promotionChangeInfoList", list4);\nstaffDetailObj.setIn("cycleTypeStr", cycleType);\n\nreturn data;\n',
                api: '/promotion/staff/data/detail',
                params: '{}',
                runWhenPageLoads: true,
                failureEvent: [
                    {
                        id: 'event_lr76y1pv',
                        name: 'onFailure',
                        waitMs: null,
                        action: 'runFunction',
                        namespace: 'errorTip',
                        method: null,
                        funcBody: '',
                        params: [
                            '"服务繁忙，请稍后再试"',
                        ],
                    },
                ],
                successEvent: [
                    {
                        id: 'event_lr76y1pw',
                        name: 'onSuccess',
                        waitMs: null,
                        action: 'runFunction',
                        namespace: 'successTip',
                        method: null,
                        funcBody: '',
                        params: [
                            '"请求成功"',
                        ],
                    },
                ],
            },
            {
                id: 'staffDetailObj',
                type: 'temporaryState',
                initValue: '{\n  promotionStaffDataBaseInfo: {},\n  promotionQuotaValueList: [],\n  promotionQuotaDetailValueList: [],\n  promotionHistoryInfoList: [],\n  promotionChangeInfoList: [],\n  cycleTypeStr: \'\'\n}',
            },
            {
                id: 'resultMap',
                type: 'temporaryState',
                initValue: '[\n    {\n        value: \'PASSED\',\n        label: \'已达标 \',\n    },\n    {\n        value: \'FAILED\',\n        label: \'未达标 \',\n    }\n]',
            },
            {
                id: 'showCheck',
                type: 'temporaryState',
                initValue: 'false',
            },
            {
                id: 'checkDetailInfoList',
                type: 'temporaryState',
                initValue: '[]',
            },
            {
                id: 'setCheckDetail',
                type: 'function',
                funcBody: 'function setCheckDetail() {\n  const { promotionStaffDataBaseInfo, promotionQuotaDetailValueList } =\n    staffDetailObj.value;\n  checkDetailInfoList.value = [];\n\n  promotionQuotaDetailValueList.forEach((item) => {\n    let month = 0;\n    Object.entries(item)?.forEach((each) => {\n      let objInfo = {\n        quotaKey: \'\',\n        quotaName: \'\',\n        quotaMonth: \'\',\n        remark: \'\',\n        quotaValue: \'\',\n        isCheck: false,\n        monthText: \'\',\n      };\n      if (\n        [\n          \'actualValue1\',\n          \'actualValue2\',\n          \'actualValue3\',\n          \'actualValue4\',\n          \'actualValue5\',\n          \'actualValue6\',\n          \'averageValue\',\n        ].includes(each[0])\n      ) {\n        month = month + 1;\n\n        objInfo.quotaKey = item.quotaKey;\n        objInfo.quotaName = item.quotaName;\n        objInfo.quotaMonth = month;\n        objInfo.quotaValue = each[1];\n        checkDetailInfoList.value.push(objInfo);\n      }\n    });\n  });\n\n  let obj = {\n    quotaKey: \'PERMISSION\',\n    quotaName: \'权限标准\',\n    quotaMonth: null,\n    remark: \'\',\n    quotaValue: promotionStaffDataBaseInfo.permissionCriteria,\n    isCheck: false,\n    monthText: \'权限标准\',\n  };\n  checkDetailInfoList.value.push(obj);\n  checkDetailInfoList.value.forEach((item) => {\n    if (item.quotaKey !== \'PERMISSION\') {\n      if (item.quotaMonth == 7) {\n        item.monthText = `平均${item.quotaName}`;\n      } else {\n        item.monthText = `${item.quotaMonth}月/${item.quotaMonth + 6}月`;\n      }\n    }\n  });\n}\n',
            },
            {
                id: 'submitRule',
                type: 'temporaryState',
                initValue: '{ remark: [{ type: \'string\', required: false, message: \'不能为空\' }] }',
            },
            {
                id: 'submitCheck',
                type: 'function',
                funcBody: 'function submitCheck() {\n  Promise.all(\n    submitForm.map((item) => {\n      return item.validate();\n    }),\n  ).then(() => {\n    let list = [];\n    checkDetailInfoList.value.forEach((item) => {\n      if (item.isCheck) {\n        list.push(item);\n      }\n    });\n    if (!list.length) {\n      utils.FMessage.error(\'请选择至少选择一个指标进行核对\');\n    } else {\n      promotionCheckInfoDTOList.value = list;\n      submitCheckListInfo.trigger();\n    }\n  });\n}\n',
            },
            {
                id: 'clearCheckModal',
                type: 'function',
                funcBody: 'function clearCheckModal() {\n  submitForm.forEach((item) => {\n    item.clearValidate?.();\n  });\n}\n',
            },
            {
                id: 'promotionCheckInfoDTOList',
                type: 'temporaryState',
                initValue: '[]',
            },
            {
                id: 'submitCheckListInfo',
                resourceType: 'rest',
                type: 'query',
                runCondition: 'manual',
                query: '',
                enableCaching: false,
                queryTimeout: 10000,
                method: 'POST',
                enableTransformer: false,
                transformer: '\n return data;',
                params: '{\npromotionCheckInfoDTOList: promotionCheckInfoDTOList.value,\num: letgoContext.mainAppState.userId\n}',
                api: '/promotion/staff/data/quota/check',
                successEvent: [
                    {
                        id: 'event_lqz39o7h',
                        name: 'onSuccess',
                        waitMs: null,
                        action: 'runFunction',
                        namespace: 'successTip',
                        method: null,
                        funcBody: '',
                        params: [
                            '"核对成功"',
                        ],
                    },
                    {
                        id: 'event_lqz39o7i',
                        name: 'onSuccess',
                        waitMs: null,
                        action: 'setTemporaryState',
                        namespace: 'showCheck',
                        method: 'setValue',
                        params: [
                            'false',
                        ],
                    },
                ],
                failureEvent: [
                    {
                        id: 'event_lr5pfb7z',
                        name: 'onFailure',
                        waitMs: null,
                        action: 'runFunction',
                        namespace: 'errorTip',
                        method: null,
                        funcBody: '',
                        params: [
                            '\'服务繁忙，请稍后再试\'',
                        ],
                    },
                ],
            },
            {
                id: 'successTip',
                type: 'function',
                funcBody: '// Tip: 函数\n\nfunction successTip(message, res) {\n  console.log(res);\n  if (res?.code === "0") {\n    const msg = res?.msg || message;\n    if (message !== "请求成功") {\n      utils.FMessage.success(msg);\n    }\n  } else {\n    const msg = res?.msg || "服务繁忙，请稍后再试";\n    utils.FMessage.error(msg);\n  }\n}\n',
            },
            {
                id: 'errorTip',
                type: 'function',
                funcBody: '// Tip: 函数\nfunction errorTip(message) {\n  utils.FMessage.error(message);\n}\n',
            },
        ],
    },
    children: [
        {
            componentName: 'FModal',
            id: 'fModal1',
            ref: 'fModal1',
            props: {
                show: {
                    type: 'JSExpression',
                    value: 'showCheck.value',
                    mock: null,
                },
                title: '核对发起',
                maskClosable: false,
                width: 1200,
                okText: '提交核对',
            },
            isLocked: false,
            condition: true,
            title: '',
            events: [
                {
                    id: 'event_lqw25hxu',
                    name: 'onCancel',
                    action: 'setTemporaryState',
                    namespace: 'showCheck',
                    method: 'setValue',
                    params: [
                        'false',
                    ],
                },
                {
                    id: 'event_lqz1jihh',
                    name: 'onOk',
                    action: 'runFunction',
                    namespace: 'submitCheck',
                    funcBody: '',
                    params: [],
                },
                {
                    id: 'event_lr0fs12v',
                    name: 'onCancel',
                    action: 'runFunction',
                    namespace: 'clearCheckModal',
                    funcBody: '',
                    params: [],
                },
            ],
            children: [
                {
                    componentName: 'FSpace',
                    id: 'fSpace4',
                    ref: 'fSpace4',
                    props: {
                        vertical: true,
                        style: {
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            paddingLeft: '4px',
                        },
                        key: '',
                        align: 'start',
                        justify: 'start',
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    loopArgs: [
                        '',
                        '',
                    ],
                    children: [
                        {
                            componentName: 'FForm',
                            id: 'fForm1',
                            ref: 'submitForm',
                            props: {
                                labelWidth: 60,
                                layout: 'inline',
                                labelPosition: 'left',
                                model: {
                                    type: 'JSExpression',
                                    value: 'item',
                                    mock: null,
                                },
                                style: {
                                    marginBottom: '22px',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'flex-start',
                                    flexWrap: 'nowrap',
                                },
                                inlineItemGap: 11,
                                span: 6,
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            loop: {
                                type: 'JSExpression',
                                value: 'checkDetailInfoList.value',
                                mock: null,
                            },
                            loopArgs: [
                                'item',
                                'index',
                            ],
                            children: [
                                {
                                    componentName: 'FFormItem',
                                    id: 'fFormItem14',
                                    ref: 'fFormItem14',
                                    props: {
                                        label: '',
                                        prop: 'quotaName',
                                        span: 3,
                                        labelWidth: '0',
                                    },
                                    isLocked: false,
                                    condition: true,
                                    title: '',
                                    children: [
                                        {
                                            componentName: 'FInput',
                                            id: 'fInput1',
                                            ref: 'fInput1',
                                            props: {
                                                'v-model': {
                                                    type: 'JSExpression',
                                                    value: 'item.quotaName',
                                                    mock: null,
                                                },
                                                'disabled': true,
                                            },
                                            isLocked: false,
                                            condition: {
                                                type: 'JSExpression',
                                                value: '[0, 7, 14, 21].includes(index)',
                                                mock: null,
                                            },
                                            title: '',
                                        },
                                    ],
                                },
                                {
                                    componentName: 'FFormItem',
                                    id: 'fFormItem45',
                                    ref: 'fFormItem45',
                                    props: {
                                        label: '',
                                        prop: 'isCheck',
                                        span: 1,
                                        labelWidth: '0',
                                    },
                                    isLocked: false,
                                    condition: true,
                                    title: '',
                                    children: [
                                        {
                                            componentName: 'FCheckbox',
                                            id: 'fCheckbox2',
                                            ref: 'fCheckbox2',
                                            props: {
                                                'v-model': {
                                                    type: 'JSExpression',
                                                    value: 'item.isCheck',
                                                    mock: null,
                                                },
                                            },
                                            isLocked: false,
                                            condition: {
                                                type: 'JSExpression',
                                                value: 'item.quotaMonth != 7',
                                                mock: null,
                                            },
                                            title: '',
                                        },
                                    ],
                                },
                                {
                                    componentName: 'FFormItem',
                                    id: 'fFormItem26',
                                    ref: 'fFormItem26',
                                    props: {
                                        label: '',
                                        prop: 'monthText',
                                        span: 3,
                                        labelWidth: '0',
                                    },
                                    isLocked: false,
                                    condition: true,
                                    title: '',
                                    children: [
                                        {
                                            componentName: 'FInput',
                                            id: 'fInput2',
                                            ref: 'fInput2',
                                            props: {
                                                'v-model': {
                                                    type: 'JSExpression',
                                                    value: 'item.monthText',
                                                    mock: null,
                                                },
                                                'disabled': true,
                                            },
                                            isLocked: false,
                                            condition: true,
                                            title: '',
                                        },
                                    ],
                                },
                                {
                                    componentName: 'FFormItem',
                                    id: 'fFormItem13',
                                    ref: 'fFormItem13',
                                    props: {
                                        label: '',
                                        prop: 'quotaValue',
                                        span: 3,
                                        labelWidth: '0',
                                    },
                                    isLocked: false,
                                    condition: true,
                                    title: '',
                                    children: [
                                        {
                                            componentName: 'FInput',
                                            id: 'fInput10',
                                            ref: 'fInput10',
                                            props: {
                                                'v-model': {
                                                    type: 'JSExpression',
                                                    value: 'item.quotaValue',
                                                    mock: null,
                                                },
                                                'disabled': true,
                                            },
                                            isLocked: false,
                                            condition: true,
                                            title: '',
                                        },
                                    ],
                                },
                                {
                                    componentName: 'FFormItem',
                                    id: 'fFormItem2',
                                    ref: 'fFormItem2',
                                    props: {
                                        label: '',
                                        prop: 'remark',
                                        span: 12,
                                        rules: {
                                            type: 'JSExpression',
                                            value: '[{\n  type: \'string\',\n  required: item.isCheck,\n  message: \'核对原因不能为空\'\n}]',
                                            mock: null,
                                        },
                                        labelWidth: '0',
                                    },
                                    isLocked: false,
                                    condition: true,
                                    title: '',
                                    children: [
                                        {
                                            componentName: 'FInput',
                                            id: 'fInput8',
                                            ref: 'fInput8',
                                            props: {
                                                'type': 'textarea',
                                                'showPassword': true,
                                                'v-model': {
                                                    type: 'JSExpression',
                                                    value: 'item.remark',
                                                    mock: null,
                                                },
                                                'maxlength': 50,
                                                'placeholder': '请输入核对原因',
                                                'rows': 1,
                                                'resize': null,
                                                'showWordLimit': true,
                                                'disabled': {
                                                    type: 'JSExpression',
                                                    value: '!item.isCheck',
                                                    mock: null,
                                                },
                                                'clearable': true,
                                                'autosize': {
                                                    minRows: 1,
                                                    maxRows: 2,
                                                },
                                            },
                                            isLocked: false,
                                            condition: {
                                                type: 'JSExpression',
                                                value: 'item.quotaMonth != 7',
                                                mock: null,
                                            },
                                            title: '',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            componentName: 'FSpace',
            id: 'fSpace1',
            ref: 'fSpace1',
            props: {
                itemStyle: {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    width: '100%',
                },
                style: {},
                align: 'stretch',
                justify: 'start',
                vertical: true,
                wrap: false,
                size: 'middle',
            },
            isLocked: false,
            condition: true,
            title: '',
            children: [
                {
                    componentName: 'FDescriptions',
                    id: 'fDescriptions1',
                    ref: 'fDescriptions1',
                    props: {
                        title: '晋级信息',
                        column: 3,
                        labelAlign: 'right',
                        bordered: false,
                        contentStyle: {
                            width: '140px',
                        },
                        labelStyle: {
                            width: '130px',
                        },
                        style: {},
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem1',
                            ref: 'fDescriptionsItem1',
                            props: {
                                label: 'UM',
                                labelStyle: {
                                    width: '80px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText4',
                                    ref: 'fText4',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: '`${staffDetailObj.value?.promotionStaffDataBaseInfo?.um}(${staffDetailObj.value?.promotionStaffDataBaseInfo?.name})`',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.um',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem2',
                            ref: 'fDescriptionsItem2',
                            props: {
                                label: '科室',
                                labelStyle: {
                                    width: '120px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText5',
                                    ref: 'fText5',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.sectionOrgName',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.sectionOrgName',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem3',
                            ref: 'fDescriptionsItem3',
                            props: {
                                label: '区域',
                                labelStyle: {
                                    width: '100px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText6',
                                    ref: 'fText6',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.areaOrgName',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.areaOrgName',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem4',
                            ref: 'fDescriptionsItem4',
                            props: {
                                label: '组别',
                                labelStyle: {
                                    width: '100px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText7',
                                    ref: 'fText7',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.groupOrgName',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.groupOrgName',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem5',
                            ref: 'fDescriptionsItem5',
                            props: {
                                label: '晋级周期',
                                labelStyle: {
                                    width: '80px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText8',
                                    ref: 'fText8',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.year + staffDetailObj.value?.promotionStaffDataBaseInfo?.period',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.year',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem6',
                            ref: 'fDescriptionsItem6',
                            props: {
                                label: '岗位类型',
                                labelStyle: {
                                    width: '120px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText19',
                                    ref: 'fText19',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.postType',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.postType',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem7',
                            ref: 'fDescriptionsItem7',
                            props: {
                                label: '当前星级',
                                labelStyle: {
                                    width: '100px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText20',
                                    ref: 'fText20',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.gradeName',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.gradeName',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem8',
                            ref: 'fDescriptionsItem8',
                            props: {
                                label: '目标星级',
                                labelStyle: {
                                    width: '100px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText21',
                                    ref: 'fText21',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.targetGradeName',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.targetGradeName',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem9',
                            ref: 'fDescriptionsItem9',
                            props: {
                                label: '晋级频率',
                                labelStyle: {
                                    width: '80px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText22',
                                    ref: 'fText22',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.promotionFrequency',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.promotionFrequency',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem10',
                            ref: 'fDescriptionsItem10',
                            props: {
                                label: '是否参加本次晋级',
                                labelStyle: {
                                    width: '120px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText23',
                                    ref: 'fText23',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.promotionRefuseFlag',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.promotionRefuseFlag',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                        {
                            componentName: 'FDescriptionsItem',
                            id: 'fDescriptionsItem12',
                            ref: 'fDescriptionsItem12',
                            props: {
                                label: '状态',
                                labelStyle: {
                                    width: '100px',
                                },
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                            children: [
                                {
                                    componentName: 'FText',
                                    id: 'fText10',
                                    ref: 'fText10',
                                    props: {
                                        children: {
                                            type: 'JSExpression',
                                            value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.cycleState',
                                            mock: null,
                                        },
                                    },
                                    isLocked: false,
                                    condition: {
                                        type: 'JSExpression',
                                        value: 'staffDetailObj.value?.promotionStaffDataBaseInfo?.cycleState',
                                        mock: null,
                                    },
                                    title: '',
                                },
                            ],
                        },
                    ],
                },
                {
                    componentName: 'FCard',
                    id: 'fCard5',
                    ref: 'fCard5',
                    props: {
                        header: '晋级指标',
                        bordered: false,
                        shadow: 'never',
                        style: {
                            width: '100%',
                        },
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'FTable',
                            id: 'wTable1',
                            ref: 'wTable1',
                            props: {
                                columns: [
                                    {
                                        prop: 'quotaName',
                                        label: '指标名',
                                    },
                                    {
                                        prop: 'actualValue',
                                        label: '个人数据',
                                    },
                                    {
                                        prop: 'targetValue',
                                        label: '晋级目标',
                                    },
                                    {
                                        prop: 'standardValue',
                                        label: '目标预计达成值',
                                    },
                                    {
                                        prop: 'resultText',
                                        label: '达标情况',
                                    },
                                ],
                                data: {
                                    type: 'JSExpression',
                                    value: 'staffDetailObj.value?.promotionQuotaValueList',
                                    mock: null,
                                },
                                layout: 'fixed',
                                size: 'small',
                                rowKey: 'index',
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                        },
                    ],
                },
                {
                    componentName: 'FCard',
                    id: 'fCard6',
                    ref: 'fCard6',
                    props: {
                        header: '数据详情',
                        bordered: false,
                        divider: true,
                        shadow: 'never',
                        style: {
                            width: '100%',
                        },
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'FTable',
                            id: 'wTable3',
                            ref: 'wTable3',
                            props: {
                                columns: [
                                    {
                                        prop: 'quotaName',
                                        label: '指标名',
                                        width: 110,
                                    },
                                    {
                                        prop: 'actual1',
                                        label: '1月/7月',
                                        width: 110,
                                    },
                                    {
                                        prop: 'actual2',
                                        label: '2月/8月',
                                        width: 110,
                                    },
                                    {
                                        prop: 'actual3',
                                        label: '3月/9月',
                                        width: 110,
                                    },
                                    {
                                        prop: 'actual4',
                                        label: '4月/10月',
                                        width: 110,
                                    },
                                    {
                                        prop: 'actual5',
                                        label: '5月/11月',
                                        width: 110,
                                    },
                                    {
                                        prop: 'actual6',
                                        label: '6月/12月',
                                        width: 110,
                                    },
                                    {
                                        prop: 'averageValue',
                                        label: '平均值',
                                        width: 110,
                                    },
                                ],
                                data: {
                                    type: 'JSExpression',
                                    value: 'staffDetailObj.value?.promotionQuotaDetailValueList',
                                    mock: null,
                                },
                                layout: 'fixed',
                                size: 'small',
                                rowKey: 'index',
                                bordered: false,
                                alwaysScrollbar: false,
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                        },
                    ],
                },
                {
                    componentName: 'FCard',
                    id: 'fCard7',
                    ref: 'fCard7',
                    props: {
                        header: '历史记录',
                        bordered: false,
                        shadow: 'never',
                        style: {
                            width: '100%',
                        },
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'FTable',
                            id: 'wTable4',
                            ref: 'wTable4',
                            props: {
                                columns: [
                                    {
                                        prop: 'index',
                                        label: '序号',
                                    },
                                    {
                                        prop: 'year',
                                        label: '年份',
                                    },
                                    {
                                        prop: 'periodText',
                                        label: '周期',
                                    },
                                    {
                                        prop: 'currentText',
                                        label: '调整前星级',
                                    },
                                    {
                                        label: '调整后星级',
                                        prop: 'targetText',
                                    },
                                    {
                                        prop: 'promotionResultText',
                                        label: '本次是否达标',
                                    },
                                    {
                                        prop: 'remark',
                                        label: '备注',
                                        width: 250,
                                        ellipsis: true,
                                    },
                                ],
                                data: {
                                    type: 'JSExpression',
                                    value: 'staffDetailObj.value?.promotionHistoryInfoList',
                                    mock: null,
                                },
                                layout: 'fixed',
                                size: 'small',
                                rowKey: 'index',
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                        },
                    ],
                },
                {
                    componentName: 'FCard',
                    id: 'fCard1',
                    ref: 'fCard1',
                    props: {
                        header: '核对记录',
                        bordered: false,
                        shadow: 'never',
                        style: {
                            width: '100%',
                        },
                    },
                    isLocked: false,
                    condition: true,
                    title: '',
                    children: [
                        {
                            componentName: 'FTable',
                            id: 'wTable5',
                            ref: 'wTable5',
                            props: {
                                columns: [
                                    {
                                        prop: 'index',
                                        label: '序号',
                                        width: 50,
                                    },
                                    {
                                        prop: 'year',
                                        label: '年份',
                                        width: 60,
                                    },
                                    {
                                        prop: 'periodText',
                                        label: '周期',
                                        width: 70,
                                    },
                                    {
                                        prop: 'quotaName',
                                        label: '核对指标',
                                        width: 110,
                                    },
                                    {
                                        prop: 'changeBeforeInfo',
                                        label: '调整前值',
                                        width: 150,
                                    },
                                    {
                                        prop: 'changeAfterInfo',
                                        label: '调整后值',
                                        width: 150,
                                    },
                                    {
                                        prop: 'changeReason',
                                        label: '备注',
                                        width: 200,
                                        ellipsis: true,
                                    },
                                    {
                                        prop: 'createdTimeText',
                                        label: '提交时间',
                                        width: 180,
                                    },
                                    {
                                        prop: 'updatedTimeText',
                                        label: '更新时间',
                                        width: 180,
                                    },
                                    {
                                        prop: 'stateText',
                                        label: '审批结果',
                                        width: 100,
                                    },
                                    {
                                        prop: 'failReason',
                                        label: '拒绝原因',
                                        width: 200,
                                        ellipsis: true,
                                    },
                                ],
                                data: {
                                    type: 'JSExpression',
                                    value: 'staffDetailObj.value?.promotionChangeInfoList',
                                    mock: null,
                                },
                                layout: 'fixed',
                                size: 'small',
                                rowKey: 'index',
                            },
                            isLocked: false,
                            condition: true,
                            title: '',
                        },
                    ],
                },
            ],
        },
    ],
};

export default info;
