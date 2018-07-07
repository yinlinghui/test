/**
 * Created by lhyin on 18/06/30.
 */
/*global jQuery IosSelect template escape unescape*/
(function ($) {
    $('#ceshiid0').html('调用了js');
    // var w = document.documentElement.clientWidth;
    var w = document.documentElement.clientWidth || document.body.clientWidth;
    $('#ceshiid').html(w);
    w > 750 ? w = 750 : w;
    var ele = document.getElementsByTagName('html')[0], size = w / 750 * 100;
    $('#ceshiid2').html(size);
    ele.style.fontSize = size + 'px';
    window.onresize = function () {
        w = document.documentElement.clientWidth || document.body.clientWidth;
        w > 750 ? w = 750 : w;
        size = w / 750 * 100;
        ele.style.fontSize = size + 'px';
    };


    // 初始化全局变量
    var vilghtData = []; //航段信息
    var cardTypeData = [
        {'id': '1', 'value': '居民身份证'},
        {'id': '2', 'value': '护照'},
        {'id': '3', 'value': '其他'},
        {'id': '4', 'value': '军官证'},
        {'id': '5', 'value': '士兵证'},
        {'id': '6', 'value': '军官离退休证'},
        {'id': '7', 'value': '居民户口薄'},
        {'id': '8', 'value': '异常身份证'},
        {'id': '9', 'value': '港澳通行证'},
        {'id': 'a', 'value': '台湾通行证'},
        {'id': 'b', 'value': '回乡证'},
        {'id': 'c', 'value': '外国护照'},
        {'id': 'd', 'value': '旅行证'},
        {'id': 'e', 'value': '居留证件'},
        {'id': 'f', 'value': '驾驶证'},
    ];
    var bankData = [];  //银行信息

    // 提交按钮上的loading
    function submitLoadingShow() {
        $('.btn-submit .icon-loading').show();
    }

    function submitLoadingHide() {
        $('.btn-submit .icon-loading').hide();
    }

    // 全局 loading
    function allLoadingShow() {
        $('.loading').removeClass('loading-hidden');
    }

    function allLoadingHide() {
        $('.loading').addClass('loading-hidden');
    }

    // 顶部导航
    $('#header').headroom({
        'tolerance': .5,
        'offset': 62,
        'classes': {
            // when above offset
            top: 'animated',
            // when below offset
            notTop: 'animated',
            // when at bottom of scoll area
            bottom: 'animated',
            // when not at bottom of scroll area
            notBottom: 'animated',
            // when element is initialised
            initial: 'animated',
            // when scrolling up
            pinned: 'slideInDown',
            // when scrolling down
            unpinned: 'slideOutUp'
        }
    });

    // 初始化模态框
    var $ModalDialog = $('#remodal').remodal({
        closeOnOutsideClick: false,
        hashTracking: false
    });
    var $ModalCloseDialog = $('#remodal-close').remodal({
        closeOnOutsideClick: false,
        hashTracking: false
    });

    $('#open').on('click', function () {
        $ModalDialog.open();
    });

    // 提交验证
    $('#submit-claims').on('click', function () {
        var $Error = checkInput();
        if ($Error === true) {
            if (!validateName()) {
                return;
            }
            if (!validateinstructions()) {
                return;
            }
            const flightNo = $('#flightNo').val();
            const data = $('#form-selfClaims').serializeArray();
            const newData = {};
            $.each(data, function () {
                newData[this.name] = this.value;
            });
            const params = {
                partner: 'minsheng',
                provider: 'I00001',
            };
            submitLoadingShow();
            $.ajax({
                url: 'http://testopen.iancar.cn/srkh5/claim/policyQuery',
                type: 'POST',
                data: $.extend(params, newData)
            })
                .done(function (data) {
                    if (data.code === 0 && data.data.policyInfoList.length > 0) {
                        sessionStorage.setItem("claimsOneInfo", JSON.stringify($.extend(params, newData, data.data.policyInfoList[0], {flightNo: flightNo})));
                        window.location.href = '/selfCustomer.html';
                    } else {
                        $('.errorMsg').html('未查询到保单信息');
                        $ModalDialog.open();
                    }
                })
                .always(function () {
                    submitLoadingHide();
                });
        } else {
            $('.errorMsg').html($Error.data('role') + '不能为空');
            $ModalDialog.open();
        }
    });

    // 表单非空验证
    function checkInput() {
        var Result = true;
        $('input[data-optional="false"]').each(function () {
            if ($(this).val() === '') {
                Result = $(this);
                return false;
            }
        });
        return Result;
    }

    // 验证被保险人姓名
    function validateName() {
        var userName = $('#userName').val(); //姓名
        var nameReg = /^[a-zA-Z\u4e00-\u9fa5]+$/;  //中文和字母
        if (!nameReg.test(userName)) {
            $('.errorMsg').html('被保险人姓名格式有误');
            $ModalDialog.open();
            return false;
        } else {
            return true;
        }
    }

    // 验证手机号
    function validatePhone() {
        var phoneName = $('input[name="barlxdh"]').val(); //手机号
        var phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!phoneReg.test(phoneName)) {
            $('.errorMsg').html('手机号格式有误');
            $ModalCloseDialog.open();
            return false;
        } else {
            return true;
        }
    }

    // 验证是否选中理赔须知
    function validateinstructions() {
        var $accept = $('.accept-info');
        if ($accept.hasClass('active')) {
            return true;
        } else {
            $('.errorMsg').html('请确认已阅读理赔须知');
            $ModalDialog.open();
            return false;
        }
    }

    // 选择审配须知
    $('.accept-info').on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    });

    try {
        if ($('#selfCustomer').length > 0 || $('#paperInfo').length > 0) {
            const claimsOneInfo = JSON.parse(sessionStorage.getItem("claimsOneInfo"));
            $('#flightNo').html(claimsOneInfo.flightNo);
            $('#flightTime').html(claimsOneInfo.departureTime);
            $('#policyBeginDate').html(claimsOneInfo.policyBeginDate.replace(/-/g, '.'));
            $('#policyEndDate').html(claimsOneInfo.policyEndDate.replace(/-/g, '.'));
            $('#policyNo').html(claimsOneInfo.policyNo);
        }

        if ($('#selfCustomer').length > 0) {
            // 根据航班号初始化航段信息
            const claimsOneInfo = JSON.parse(sessionStorage.getItem("claimsOneInfo"));
            $('input[name="fullName"]').val(claimsOneInfo.insuredName);
            const params = {
                flightDate: claimsOneInfo.departureTime,
                flightNo: claimsOneInfo.flightNo
            };
            allLoadingShow();
            $.ajax({
                url: 'http://testopen.iancar.cn/srkh5/claim/flightQuery',
                type: 'POST',
                data: params
            })
                .done(function (data) {
                    if (data.code === 0) {
                        if (data.data.vilghtDataVo === null) {
                            $('.errorMsg').html('未查询到航段信息');
                            $ModalDialog.open();
                        } else {
                            const newData = [];
                            $.each(data.data.vilghtDataVo, function () {
                                const newDataItem = {};
                                newDataItem.id = this.depCode + '-' + this.arrCode;
                                newDataItem.value = this.depName + '(' + this.depCode + ')-' + this.arrName + '(' + this.arrCode + ')';
                                newData.push(newDataItem);
                            });
                            vilghtData = newData;
                        }
                    } else {
                        $('.errorMsg').html('获取航段信息失败');
                        $ModalDialog.open();
                    }
                })
                .always(function () {
                    allLoadingHide();
                });

            // 初始化银行账户信息
            $.ajax({
                url: 'http://testopen.iancar.cn/srkh5/claim/getBankAll',
                type: 'POST',
                data: {}
            })
                .done(function (data) {
                    if (data.code === 0) {
                        const newData = [];
                        $.each(data.data, function () {
                            const newDataItem = {};
                            newDataItem.id = this.bankCode;
                            newDataItem.value = this.bankName;
                            newData.push(newDataItem);
                        });
                        bankData = newData;
                    } else {
                        $('.errorMsg').html('获取银行信息失败');
                        $ModalDialog.open();
                    }
                })
        }
    } catch (e) {
    }

    // 是否报销票据
    $('.isPaper').on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) {
            window.location.href = '/selfCustomer.html';
        } else {
            window.location.href = '/paperInfo.html';
        }
    });

    // 返回首页
    $('#goIndex').on('click', function () {
        sessionStorage.setItem("claimsOneInfo", '');
        window.location.href = '/index.html';
    });

    // 返回上一页
    $('#goBack').on('click', function () {
        history.back();
    });

    // 提交更多信息(下一步)
    $('#submit-customer').on('click', function () {
        var $Error = checkInput();
        if ($Error === true) {
            if (!validatePhone()) {
                return;
            }
            const depArrvilghtId = $('#depArrvilghtId').val();
            const depArrvilghtName = $('#depArrvilghtName').val();
            const data = $('#form-selfCustomer').serializeArray();
            const formData = {};
            $.each(data, function () {
                formData[this.name] = this.value;
            });
            const claimsOneInfo = JSON.parse(sessionStorage.getItem("claimsOneInfo"));
            const claimsOneData = {
                flightNo: claimsOneInfo.flightNo,
                flightDate: claimsOneInfo.departureTime,
                depCode: depArrvilghtId.split('-')[0], //起飞地
                Departure: (depArrvilghtName.split('-')[0]).split('(')[0], // 起飞地机场名字
                arrCode: depArrvilghtId.split('-')[1],
                Destination: depArrvilghtName.split('-')[1].split('(')[0],
                cardType: claimsOneInfo.insuredCertType,
                cardId: claimsOneInfo.insuredCertNo,
                policyNo: claimsOneInfo.policyNo
            }
            const params = $.extend(formData, claimsOneData);
            sessionStorage.setItem("claimsOneInfo", JSON.stringify(params));
            window.location.href = '/selfUpload.html';
        } else {
            $('.errorMsg').html($Error.data('role') + '不能为空');
            $ModalCloseDialog.open();
        }
    });

    // 上传图片
    if ($('#selfUpload').length > 0) {
        $("#picture1").uploadImg({
            eleId: "#pic1"
        });
        $("#picture2").uploadImg({
            eleId: "#pic2"
        });
    }

    // 提交报案
    $('#submit-upload').on('click', function () {
        if ($("#pic1").data("imgData") === undefined) {
            $('.errorMsg').html('请上传登机牌');
            $ModalDialog.open();
            return;
        }
        if ($("#pic2").data("imgData") === undefined) {
            $('.errorMsg').html('请上传刷卡证明');
            $ModalDialog.open();
            return;
        }
        const claimsOneInfo = JSON.parse(sessionStorage.getItem("claimsOneInfo"));
        var form = new FormData();
        form.append("filelist", $("#pic1").data("imgData"));
        form.append("filelist", $("#pic2").data("imgData"));
        form.append("flightNo", claimsOneInfo.flightNo);
        form.append("flightDate", claimsOneInfo.flightDate);
        form.append("depCode", claimsOneInfo.depCode);
        form.append("Departure", claimsOneInfo.Departure);
        form.append("arrCode", claimsOneInfo.arrCode);
        form.append("Destination", claimsOneInfo.Destination);
        form.append("cardType", claimsOneInfo.cardType);
        form.append("cardId", claimsOneInfo.cardId);
        form.append("fullName", claimsOneInfo.fullName);
        form.append("barlxdh", claimsOneInfo.barlxdh);
        form.append("paBankInfoYhmc", claimsOneInfo.paBankInfoYhmc);
        form.append("paBankInfoKhhzh", claimsOneInfo.paBankInfoKhhzh);
        form.append("paBankInfoKhhszs", claimsOneInfo.paBankInfoKhhszs);
        form.append("paBankInfoKhhszd", claimsOneInfo.paBankInfoKhhszd);
        form.append("eticketNo", claimsOneInfo.eticketNo);
        form.append("policyNo", claimsOneInfo.policyNo);
        submitLoadingShow();
        $.ajax({
            type: "post",
            url: "http://testopen.iancar.cn/srkh5/claim/flightClaim",
            data: form,
            contentType: false, // 注意这里应设为false
            processData: false,    //false
            cache: false,    //缓存
            success: function (data) {
                if (data.code === 0) {
                    window.location.href = '/selfSuccess.html';
                } else {
                    $('.errorMsg').html(data.msg);
                    $ModalDialog.open();
                }
            }
        })
            .always(function () {
                submitLoadingHide();
            });
    });

    // 案件查询
    $('#search-claims').on('click', function () {
        var $Error = checkInput();
        if ($Error === true) {
            if (!validateName()) {
                return;
            }
            if (!validateinstructions()) {
                return;
            }
            const data = $('#form-searchClaims').serializeArray();
            const newData = {};
            $.each(data, function () {
                newData[this.name] = this.value;
            });
            submitLoadingShow();
            $.ajax({
                url: 'http://testopen.iancar.cn/srkh5/claim/claimQuery',
                type: 'POST',
                data: newData
            })
                .done(function (data) {
                    if (data.code === 0 && data.data.baoAInforByInsurTypeVoList.length > 0) {
                        newData.cardTypeName = $('#cardTypeName').val();
                        sessionStorage.setItem("claimsListInfo", JSON.stringify($.extend({data: data.data.baoAInforByInsurTypeVoList}, {searchData: newData})));
                        window.location.href = '/claimsList.html';
                    } else {
                        $('.errorMsg').html('未查询到理赔信息');
                        $ModalDialog.open();
                    }
                })
                .always(function () {
                    submitLoadingHide();
                });
        } else {
            $('.errorMsg').html($Error.data('role') + '不能为空');
            $ModalDialog.open();
        }
    });

    // 案件列表
    if ($('#claimsList').length > 0) {
        const claimsListInfo = JSON.parse(sessionStorage.getItem("claimsListInfo"));
        $('#fullName').html(claimsListInfo.searchData.Bbrxm);
        $('#cardType').html(claimsListInfo.searchData.cardTypeName);
        $('#cardNum').html(claimsListInfo.searchData.Bbrzjhm);
        var tpl = document.getElementById('tpl').innerHTML;
        const claimsListData = claimsListInfo.data;
        for (var i = 0; i < claimsListData.length; i++) {
            claimsListData[i].barq = dataFormat(claimsListData[i].barq);
            claimsListData[i].cxrq = dataFormat(claimsListData[i].cxrq);
            claimsListData[i].bah = claimsListData[i].bah === null ? '暂无' : claimsListData[i].bah;
            claimsListData[i].stateClass = claimsListData[i].ajzt === '已结案' ? 'orangeColor' : 'redColor';
        }
        var html = template(tpl, {list: claimsListData});
        $('#claimsList-container').append(html);
    }

    // 选择证件类型
    if ($('#selfClaims').length > 0 || $('#claimsSearch').length > 0) {
        var showCardTypeDom = document.querySelector('#showCardType');
        var cardTypeId = document.querySelector('#cardTypeId');
        var cardTypeName = document.querySelector('#cardTypeName');
        showCardTypeDom.addEventListener('click', function () {
            setIosSelect(cardTypeData, showCardTypeDom, cardTypeId, cardTypeName);
        });
    }

    // 选择航段信息
    var showVilghtDom = document.querySelector('#showVilght');
    var depArrvilghtId = document.querySelector('#depArrvilghtId');
    var depArrvilghtName = document.querySelector('#depArrvilghtName');
    $('#showVilght').on('click', function () {
        setIosSelect(vilghtData, showVilghtDom, depArrvilghtId, depArrvilghtName);
    });

    // 选择银行信息
    var showBankDom = document.querySelector('#showBank');
    var bankId = document.querySelector('#bankId');
    var bankName = document.querySelector('#bankName');
    $('#showBank').on('click', function () {
        setIosSelect(bankData, showBankDom, bankId, bankName);
    });

    function setIosSelect(data, showDom, valueId, valueName) {
        var newValueId = showDom.dataset['id'];
        var vilghtSelect = new IosSelect(1, [data],
            {
                container: '.iosSelect-container',
                title: '',
                itemHeight: 40,
                itemShowCount: 5,
                oneLevelId: newValueId,
                callback: function (selectOneObj) {
                    valueId.value = selectOneObj.id;
                    valueName.value = selectOneObj.value;
                    showDom.innerHTML = selectOneObj.value;
                }
            });
    }

    // 选择开户行所在地
    var provinceData = function getBankProvince(callback) {
        $.ajax({
            url: 'http://testopen.iancar.cn/srkh5/claim/getProvinceByBankCode',
            type: 'POST',
            data: {bankCode: $('#bankId').val()}
        })
            .done(function (data) {
                if (data.code === 0) {
                    const newData = [];
                    $.each(data.data, function () {
                        const newDataItem = {};
                        newDataItem.id = this.provinceCode;
                        newDataItem.value = this.provinceName;
                        newDataItem.parentId = '0';
                        newData.push(newDataItem);
                    });
                    callback(newData);
                }
            })
    }
    var cityData = function getBankCity(province, callback) {
        $.ajax({
            url: 'http://testopen.iancar.cn/srkh5/claim/getCityByProvinceCode',
            type: 'POST',
            data: {provinceCode: province}
        })
            .done(function (data) {
                if (data.code === 0) {
                    const newData = [];
                    $.each(data.data, function () {
                        const newDataItem = {};
                        newDataItem.id = this.cityCode;
                        newDataItem.value = this.cityName;
                        newDataItem.parentId = province;
                        newData.push(newDataItem);
                    });
                    callback(newData);
                }
            })
    }

    var showBankAddressDom = document.querySelector('#showBankAddress');
    var bankProvince = document.querySelector('#bankProvince');
    var bankCity = document.querySelector('#bankCity');
    $('#showBankAddress').on('click', function () {
        if ($('#bankId').val() === '') {
            $('.errorMsg').html('请先选择银行信息,再选择开户行所在地');
            $ModalCloseDialog.open();
        } else {
            var newValueId = showBankAddressDom.dataset['province'];
            var iosSelect = new IosSelect(2, [provinceData, cityData],
                {
                    title: '',
                    itemHeight: 40,
                    itemShowCount: 5,
                    oneLevelId: newValueId,
                    showLoading: true,
                    callback: function (selectOneObj, selectTwoObj) {
                        bankProvince.value = selectOneObj.id;
                        bankCity.value = selectTwoObj.id;
                        showBankAddressDom.innerHTML = selectOneObj.value + ' ' + selectTwoObj.value;
                    }
                });
        }
    });

    // 选择航班日期
    var selectDateDom = $('#selectDate');
    var showDateDom = $('#showDate');
    var timeData = $('#timeData');
    var now = new Date();
    var nowYear = now.getFullYear();
    var nowMonth = now.getMonth() + 1;
    var nowDate = now.getDate();
    showDateDom.attr('data-year', nowYear);
    showDateDom.attr('data-month', nowMonth);
    showDateDom.attr('data-date', nowDate);
    // 数据初始化
    function formatYear(nowYear) {
        var arr = [];
        for (var i = nowYear - 5; i <= nowYear + 5; i++) {
            arr.push({
                id: i + '',
                value: i + '年'
            });
        }
        return arr;
    }

    function formatMonth() {
        var arr = [];
        for (var i = 1; i <= 12; i++) {
            arr.push({
                id: i + '',
                value: i + '月'
            });
        }
        return arr;
    }

    function formatDate(count) {
        var arr = [];
        for (var i = 1; i <= count; i++) {
            arr.push({
                id: i + '',
                value: i + '日'
            });
        }
        return arr;
    }

    var yearData = function (callback) {
        callback(formatYear(nowYear))
    }
    var monthData = function (year, callback) {
        callback(formatMonth());
    };
    var dateData = function (year, month, callback) {
        if (/^(1|3|5|7|8|10|12)$/.test(month)) {
            callback(formatDate(31));
        }
        else if (/^(4|6|9|11)$/.test(month)) {
            callback(formatDate(30));
        }
        else if (/^2$/.test(month)) {
            if (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0) {
                callback(formatDate(29));
            }
            else {
                callback(formatDate(28));
            }
        }
        else {
            throw new Error('不存在的月份');
        }
    };
    selectDateDom.bind('click', function () {
        var oneLevelId = showDateDom.attr('data-year');
        var twoLevelId = showDateDom.attr('data-month');
        var threeLevelId = showDateDom.attr('data-date');
        var iosSelect = new IosSelect(3, [yearData, monthData, dateData],
            {
                title: '',
                itemHeight: 40,
                itemShowCount: 5,
                oneLevelId: oneLevelId,
                twoLevelId: twoLevelId,
                threeLevelId: threeLevelId,
                showLoading: true,
                callback: function (selectOneObj, selectTwoObj, selectThreeObj) {
                    showDateDom.attr('data-year', selectOneObj.id);
                    showDateDom.attr('data-month', selectTwoObj.id);
                    showDateDom.attr('data-date', selectThreeObj.id);
                    timeData.attr('value', fillDateStr(selectOneObj.id) + '-' + fillDateStr(selectTwoObj.id) + '-' + fillDateStr(selectThreeObj.id));
                    showDateDom.html(selectOneObj.value + ' ' + selectTwoObj.value + ' ' + selectThreeObj.value);
                }
            });
    });

    // YYYY-mm-dd 转化成 yy/mm//dd
    function dataFormat(dataStr) {
        var r = dataStr.substring(2, 4) + "/" + dataStr.substring(5, 7) + "/" + dataStr.substring(8, 10);
        return r;
    }

    function fillDateStr(n) {
        return n < 10 ? '0' + n : n
    }

})(jQuery);

//# sourceMappingURL=common.js.map
