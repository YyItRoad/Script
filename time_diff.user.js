// ==UserScript==
// @name         time_diff
// @namespace    http://boc.ink/
// @version      0.6.0
// @description  try to take over the world!
// @author       YY
// @match        *://vip.win007.com/changeDetail/handicap.aspx*
// @match        *://vip.win0168.com/changeDetail/handicap.aspx*
// @match        *://vip.win0168.com/AsianOdds_n.aspx*
// @match        *://vip.win007.com/AsianOdds_n.aspx*
// @match        *://vip.win0168.com/1x2/OddsHistory.aspx*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
// @require      https://cdn.bootcss.com/echarts/4.4.0-rc.1/echarts.min.js
// @grant        none
// ==/UserScript==
var now_year = new Date().getFullYear();
var now_month = new Date().getMonth() + 1;
const company_names = ['澳门', '易胜博', '利记', '明陞', '12bet', 'Crown', '金宝博', '盈禾', '韦德', '平博', 'Bet365', '10BET', '18Bet', '立博'];
const needCompany = ['澳门', '易胜', '利记'];
function handicapToPoints (handicap) {
    let opposite = false;
    if (handicap.indexOf('受让') == 0) {
        opposite = true;
        handicap = handicap.replace('受让', '');
    }
    let point = 0;
    switch (handicap) {
        case '平手': point = 0; break;
        case '平手/半球': point = 0.25; break;
        case '平/半': point = 0.25; break;
        case '半球': point = 0.5; break;
        case '半球/一球': point = 0.75; break;
        case '半/一': point = 0.75; break;
        case '一球': point = 1; break;
        case '一球/球半': point = 1.25; break;
        case '一/球半': point = 1.25; break;
        case '球半': point = 1.5; break;
        case '球半/两球': point = 1.75; break;
        case '球半/两': point = 1.75; break;
        case '两球': point = 2; break;
        case '两球/两球半': point = 2.25; break;
        case '两/两球半': point = 2.25; break;
        case '两球半': point = 2.5; break;
        case '两球半/三球': point = 2.75; break;
        case '两球半/三': point = 2.75; break;
        case '三球': point = 3; break;
        case '三球/三球半': point = 3.25; break;
        case '三/三球半': point = 3.25; break;
        case '三球半': point = 3.5; break;
        case '三球半/四球': point = 3.75; break;
        case '三球半/四': point = 3.75; break;
        case '四球': point = 4; break;
        case '四球/四球半': point = 4.25; break;
        case '四/四球半': point = 4.25; break;
        case '四球半': point = 4.5; break;
        case '四球半/五球': point = 4.75; break;
        case '四球半/五': point = 4.75; break;
        case '五球': point = 5; break;
        case '五球/五球半': point = 5.25; break;
        case '五/五球半': point = 5.25; break;
        case '五球半': point = 5.5; break;
        case '五球半/六球': point = 5.75; break;
        case '五球半/六': point = 5.75; break;
        case '六球': point = 6; break;
        case '六球/六球半': point = 6.25; break;
        case '六/六球半': point = 6.25; break;
        case '六球半': point = 6.5; break;
        default: point == 100;
    }
    if (opposite) {
        point = -point;
    }
    return point;
}

function getQueryString (name, r) {
    if (r == undefined) r = window.location.search.substr(1)
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    let res = r.match(reg);
    if (res != null) return unescape(res[2]); return null;
}

function getTime (date) {
    let month = date.split('-')[0];
    let year = now_year;
    if (now_month == 12 && month <= 3) {
        year++;
    } else if (now_month == 1 && month > 10) {
        year--;
    }
    return new Date(`${year}-${date}`);
}
var Odds = function ({ home, away, date, handicap, state }) {
    this.home = home;
    this.away = away;
    this.date = getTime(date);
    this.handicap = handicapToPoints(handicap);
    this.state = state;
}

Odds.prototype.getData = function (home = true) {
    return [this.date, this.getOdd(home)];
};

Odds.prototype.getOdd = function (home = true) {
    return home ? this.home : this.away;
};

/// 解析比赛头部信息
function getHeaderInfo (odds) {
    let homeName = $('.header .home a').text().trim().split(/\s+/)[0];
    let guestName = $('.header .guest a').text().trim().split(/\s+/)[0];
    let vsInfo = $('.header .vs .row').first().text().trim().split(/\s+/);
    let leagueName = vsInfo[0], startDate = vsInfo[1], startTime = vsInfo[2];
    let scoreInfo = $('#headVs').text().trim().split(/\s+/);
    let scoreHome = scoreInfo[0], scoreGuest = scoreInfo[3], matchStatus = scoreInfo[1];

    let href = $('#tabs a').first().attr('href');
    let matchId = getQueryString('id', href.substr(1));
    function add (a, b) {
        return (parseFloat(a) + parseFloat(b)).toFixed(2)
    }
    let data = [startDate, startTime, matchId, leagueName, homeName, guestName, add(odds[0], odds[2]), odds[0], odds[1], odds[2], add(odds[3], odds[5]), odds[3], odds[4], odds[5], scoreHome, scoreGuest].join(' ');
    console.log(data, matchStatus);
    $('#dataPanel').text(data);
}

/// 获取公司水位信息
function getOddsInfo (tds) {
    let needIndexs = [2, 3, 4, 8, 9, 10];
    let datas = [];
    for (var i = 0; i < tds.length; i++) {
        let td = $(tds[i]);
        if (i == 0) name = td.text().trim();
        if (needIndexs.includes(i)) {
            if (i == 3 || i == 9) {
                datas.push(td.attr('goals'));
            } else {
                datas.push(td.text());
            }
        }
    }
    getHeaderInfo(datas);
}

function insertContent () {
    function heredoc (fn) {
        return fn.toString().split('\n').slice(1, -1).join('\n') + '\n'
    }
    var content = heredoc(function () {/*
        <div id='dataPanel' style="position:absolute;top: 10px;right:10px;"></div>
        <div id='oddsChart' style="width:100%;padding-top:10px"></div>
        <div id='euchart' style="width:100%;padding-top:10px"></div>
        <div id='others' style="position:absolute;top: 10px;left:10px;">
        <button id='lineType'></button>
        </div>
        */});
    $('#MiddleAd').height('100%');
    $('#MiddleAd').css('padding', '20px 0');
    $('#MiddleAd').append(content);
    $('#MiddleAd').css('position', 'relative');
}

; (function () {
    'use strict';
    console.log('时间差插件!!!', location.host, location.pathname);
    var begin_time;
    //转化为日期对象
    function textToDate (text) {
        return moment(text, "MM-DD HH:mm");
    }
    function diffMinutes (m, b) {
        return (b ? b : begin_time).diff(m, 'minutes');
    }
    function formatHour (mm) {
        if (mm < 60) return mm + 'm';
        return (parseInt(mm / 60) + (mm % 60 / 60)).toFixed(1) + 'h';
    }
    function diffOdds (a, b) {
        return (b * 100 - a * 100).toFixed(0);
    }
    function diffArray (arr1, arr2) {
        return arr1.concat(arr2).filter(item => !arr1.includes(item) || !arr2.includes(item));
    }

    function dateCompare (date1, date2, toType = 'ss') {
        if (typeof date1 == "string") {
            date1 = new Date(date1);
        }
        if (typeof date2 == "string") {
            date2 = new Date(date2);
        }
        let dert = Math.abs(date1.getTime() - date2.getTime());
        let ss = Math.floor(dert / 1000);
        let compare = ss;
        if (toType === 'mm') {
            compare = ss / 60;
        }
        return compare;
    }

    function handleOdds () {
        console.log('handleOdds');
        begin_time = textToDate($('table tr td[bgcolor="red"]').parents('tr>td+td+td').parent().first().find('td').html());
        console.log('begin_time:', begin_time.format());
        var oddsTable = "table[cellspacing='1'] tr";
        var lists = $(oddsTable);
        var date_index = $(oddsTable + ":nth-child(1) td").length - 1;
        $(oddsTable + ":nth-child(1)" + " td:nth-child(" + date_index + ")").attr('width', 160);

        var last_date, last_home, last_away;
        for (var i = 2; i <= lists.length; i++) {
            var date_sel = oddsTable + ":nth-child(" + i + ")" + " td:nth-child(" + date_index + ")";
            var state_str = $(oddsTable + ":nth-child(" + i + ")" + " td.hg_blue").text();
            var home_sel = oddsTable + ":nth-child(" + i + ")" + " td:nth-child(" + (date_index - 3) + ")";
            var pre_home_sel = oddsTable + ":nth-child(" + (i - 1) + ")" + " td:nth-child(" + (date_index - 3) + ")";
            var away_sel = oddsTable + ":nth-child(" + i + ")" + " td:nth-child(" + (date_index - 1) + ")";
            var pre_away_sel = oddsTable + ":nth-child(" + (i - 1) + ")" + " td:nth-child(" + (date_index - 1) + ")";
            if (state_str == '滚') {
                $(oddsTable + ":nth-child(" + i + ")").hide();
                continue
            };
            var date_str = $(date_sel).text();
            var date_odd = textToDate(date_str);
            var home_odd = $(home_sel).text();
            var away_odd = $(away_sel).text();
            var diff_begin = formatHour(diffMinutes(date_odd));
            if (last_date) {
                diff_begin = diff_begin + "[" + diffMinutes(date_odd, last_date) + "]";
            }
            if (last_home != undefined) {
                $(pre_home_sel).find('b').text($(pre_home_sel).text() + ' | ' + diffOdds(home_odd, last_home));
                $(pre_away_sel).find('b').text($(pre_away_sel).text() + ' | ' + diffOdds(away_odd, last_away));
            }
            last_date = date_odd;
            last_home = home_odd;
            last_away = away_odd;
            $(date_sel).text(date_str + ' | ' + diff_begin);
        }
    }

    function handleCompany () {
        console.log('handleCompany');
        //注入UI
        insertContent();
        var companies = {};
        var trs = $('#odds tr');
        let last_name, last_array;
        for (var i = 2; i < trs.length; i++) {
            let ctds = $(trs[i]).find('td');
            let name = ctds.first().text().trim();
            if (name == '澳门') getOddsInfo(ctds);
            if (name.startsWith('最')) continue;
            if (name.length > 0 && name !== last_name) {
                last_name = name;
                last_array = [trs[i]];
                companies[name] = last_array;
            } else {
                last_array = companies[last_name];
                last_array.push(trs[i]);
            }
        }
        let all_companies = Object.keys(companies).sort(function (a, b) {
            let index1 = company_names.indexOf(a);
            let index2 = company_names.indexOf(b);
            if (index1 == -1) index1 = 99;
            if (index2 == -1) index2 = 99;
            return index1 - index2;
        });
        let first_td;
        for (let j = 0; j < all_companies.length; j++) {
            let htmls = companies[all_companies[j]];
            for (let k = 0; k < htmls.length; k++) {
                if (!first_td) {
                    first_td = htmls[k];
                } else {
                    first_td.before(htmls[k]);
                }
            }
        }
        $('#odds tr:nth-child(2)').after(first_td);
        var key = getQueryString('key') || localStorage.getItem('url_key');
        if (key) {
            localStorage.setItem('url_key', key);
        }
        showChart(key);
    }

    function handleHistory () {
        console.log('handleHistory');
        var tds = $('#odds > table tr td.font12');
        let last_date, first_kl1, first_kl2, first_kl3;
        function diffKl (kl1, kl2) {
            return parseInt(parseFloat(kl1) * 100 - parseFloat(kl2) * 100);
        }
        for (var i = 0; i < tds.length; i++) {
            if (i == 0 || i == tds.length - 1) {
                var pre3 = $(tds[i]).prev()[0];
                var pre2 = $(pre3).prev()[0];
                var pre1 = $(pre2).prev()[0];
                console.log(pre1.textContent, pre2.textContent, pre3.textContent);
                if (i == 0) {
                    first_kl1 = pre1; first_kl2 = pre2; first_kl3 = pre3;
                } else {
                    $(first_kl1).text(first_kl1.textContent + '|' + diffKl(first_kl1.textContent, pre1.textContent));
                    $(first_kl2).text(first_kl2.textContent + '|' + diffKl(first_kl2.textContent, pre2.textContent));
                    $(first_kl3).text(first_kl3.textContent + '|' + diffKl(first_kl3.textContent, pre3.textContent));
                }
            }
            var date = textToDate($(tds[i]).text().replace('(初盘)', ''));
            if (last_date) {
                $(tds[i - 1]).text($(tds[i - 1]).text() + " [" + diffMinutes(date, last_date) + ']');
            }
            last_date = date;
        }
    }

    function showChart (key) {
        const need_companies = [1, 3, 12, 17, 24, 23, 31, 35];
        const chart_color = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
        const company_ids = {
            "1": "澳门",
            "2": "ManbetX",
            "3": "Crown",
            "4": "立博",
            "8": "Bet365",
            "12": "易胜博",
            "14": "韦德",
            "17": "明陞",
            "22": "10BET",
            "23": "金宝博",
            "24": "12bet",
            "31": "利记",
            "35": "盈禾",
            "42": "18Bet",
            "47": "平博"
        }
        var myChart;
        var gameData;
        var lineType = localStorage.getItem('lineType') || '主队';
        var tooltip_data = {};
        var legend_selected = JSON.parse(localStorage.getItem('legend_selected'));

        function showAllChart () {
            console.log('showAllChart');
            getOddsData(showOddsChart);
        }

        showAllChart();

        function showOddsChart (allNames, all_odds) {
            console.log('showOddsChart', allNames);
            var odds_legend_selected = JSON.parse(localStorage.getItem('odds_legend_selected'));
            var tooltip_datas = {};
            var oddsChart;
            var statistics = {};

            $('#oddsChart').height('500px');
            oddsChart = echarts.init(document.getElementById('oddsChart'));
            oddsChart.on('legendselectchanged', function (params) {
                odds_legend_selected = params.selected;
                localStorage.setItem('odds_legend_selected', JSON.stringify(params.selected));
            });

            function loadOddsChart (t_home = true) {

                function getCutOdds (time) {
                    let allCutOdds;
                    if (tooltip_datas[time]) {
                        allCutOdds = tooltip_datas[time];
                    } else {
                        function getOdds (sheets = []) {
                            let last_sheet;
                            for (let i = 0; i < sheets.length; i++) {
                                const sheet = sheets[i];
                                let dert_time = time - sheet.date.getTime()
                                if (dert_time < 0) {
                                    break;
                                }
                                last_sheet = sheet;
                            }
                            return last_sheet;
                        }

                        allCutOdds = {};
                        for (let index = 0; index < allNames.length; index++) {
                            const c_name = allNames[index];
                            let odd = getOdds(all_odds[c_name]);
                            if (odd) {
                                allCutOdds[c_name] = odd;
                            }
                        }
                        tooltip_datas[time] = allCutOdds;
                    }

                    let cutOdds = [];
                    for (let index = 0; index < allNames.length; index++) {
                        const c_name = allNames[index];
                        let c_odds = allCutOdds[c_name];
                        let selected = odds_legend_selected == null || odds_legend_selected[c_name];
                        if (c_odds && selected) {
                            cutOdds.push(`${c_name}: [${c_odds.handicap}]${c_odds.getOdd(t_home)}`);
                        }
                    }
                    return cutOdds;
                }

                var legend = [];
                var series = [];
                var diff_handicaps = [];

                for (let i = 0; i < needCompany.length; i++) {
                    const name = needCompany[i];
                    legend.push(name);
                    let c_odds = all_odds[name] || [];

                    let c_data = [];
                    let last_handicap;
                    let diff_handicap = 0;
                    for (let j = 0; j < c_odds.length; j++) {
                        const c_odd = c_odds[j];
                        if (c_odd.handicap != last_handicap) { diff_handicap++; last_handicap = c_odd.handicap };
                        c_data.push(c_odd.getData(t_home));
                    }
                    if (diff_handicap != 0) diff_handicaps.push(`${name}:${diff_handicap}`);
                    series.push({
                        type: 'line',
                        data: c_data,
                        name,
                    });
                }
                statistics['diff_handicap'] = diff_handicaps;
                var option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross'
                        },
                        formatter: function (params) {
                            let series = params[0];
                            let data = getCutOdds(series.axisValue);
                            return [series.axisValueLabel, ...data].join("<br/>");
                        }
                    },
                    legend: {
                        data: legend,
                        selected: odds_legend_selected
                    },
                    xAxis:
                    {
                        type: 'time',
                        axisPointer: {
                            label: {
                                formatter: function (params) {
                                    return moment(params.value).format('MM-DD HH:mm') + '【' + dateCompare(begin_time, new Date(params.value), 'mm') + '】';
                                }
                            }
                        }
                    },
                    dataZoom: [{
                        type: 'inside',
                        filterMode: 'none',
                    }, {
                        filterMode: 'none',
                        handleSize: '100%',
                        handleStyle: {
                            color: '#fff',
                            shadowBlur: 3,
                            shadowColor: 'rgba(0, 0, 0, 0.6)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        scale: true,
                        min: 0.6,
                        max: 1.2,
                    }],
                    series: series,
                    axisPointer: {
                        label: {
                            backgroundColor: '#666'
                        }
                    },
                };
                oddsChart.setOption(option);
            }
            $('#lineType').text(lineType);
            loadOddsChart(lineType === '主队');
            $('#lineType').click(function () {
                lineType = lineType === '主队' ? '客队' : '主队';
                $(this).text(lineType);
                localStorage.setItem('lineType', lineType);
                loadOddsChart(lineType === '主队');
            });
            //变盘次数
            let diff_handicaps = statistics['diff_handicap'];
            if (diff_handicaps.length != 0) {
                var diff_handicap_str = '变盘: ';
                for (let i = 0; i < diff_handicaps.length; i++) {
                    const diff_handicap = diff_handicaps[i];
                    diff_handicap_str += diff_handicap;
                }
                $('#others').append(diff_handicap_str);
            }
        }

        function getOddsData (callback) {
            console.log('getOddsData');
            var all_odds = {};
            var allNames;

            function handleOdds (index, odds) {
                let name = allNames[index];
                if (name) {
                    let os = all_odds[name] || [];
                    os.push(odds);
                    all_odds[name] = os;
                }
            }

            let ods = document.getElementById('oddsDetail');
            let trs = ods.getElementsByTagName('tr');
            let tds = trs.item(0).getElementsByTagName('td');

            function getCompanyNames () {
                let names = []
                for (let j = 0; j < tds.length - 1; j++) {
                    var name = tds[j].innerText;
                    if (name.length > 0) {
                        if (name == '比分') break;
                        names.push(name);
                    }
                }
                return names;
            }

            allNames = getCompanyNames();

            let needCompanyIndex = [];
            for (let i = 0; i < needCompany.length; i++) {
                const company = needCompany[i];
                let c_index = allNames.indexOf(company);
                if (c_index >= 0) needCompanyIndex.push(c_index);
            }
            let last_date;
            for (let i = trs.length - 1; i >= 0; i--) {
                let tr = trs[i];
                let tds = tr.getElementsByTagName('td');
                if (tds.length <= 0) continue;
                let date = tds[tds.length - 1].innerHTML;
                let score = tds[tds.length - 2].innerHTML;
                if (score.length > 0) {
                    if (score.indexOf('-') > 0) {
                        last_date = date;
                    }
                    begin_time = textToDate(last_date.replace('<br>', ' ')).toDate();
                    break;
                };
                last_date = date;
                for (let j = 0; j < tds.length - 1; j++) {
                    if (needCompanyIndex.indexOf(j) < 0) continue;
                    const td = tds[j];
                    let datas = td.innerHTML.split('<br>');
                    if (datas.length > 1) {
                        let f3s = td.getElementsByClassName('f3').item(0).textContent;
                        let f2s = td.getElementsByClassName('f2').item(0).textContent;
                        let h = datas[0];
                        if (f3s && f3s.length > 0) {
                            let odd = new Odds({ home: f3s, away: f2s, date: date.replace('<br>', ' '), handicap: h, state: score.length > 0 })
                            handleOdds(j, odd);
                        }
                    }
                }
            }
            callback(allNames, all_odds);
        }

        function loadChart (all_datas) {
            gameData = all_datas;
            function getCutOdds (time) {
                if (tooltip_data[time]) {
                    return tooltip_data[time];
                }
                function getOdds (sheet) {
                    let all_time = sheet.all_shifts_time;
                    let all_home = sheet.all_shifts_home;
                    let all_away = sheet.all_shifts_away;
                    let all_handicap = sheet.all_shifts_handicap;
                    let home, away, handicap, date;
                    for (let index = all_time.length - 1; index >= 0; index--) {
                        let ihome = all_home[index];
                        let iaway = all_away[index];
                        let ihandicap = all_handicap[index];
                        let idate = new Date(all_time[index]);
                        let dert_time = time - idate.getTime();
                        if (dert_time < 0) {
                            break;
                        }
                        home = ihome;
                        away = iaway;
                        handicap = ihandicap;
                        date = idate;
                    }
                    return home != undefined && { home, away, handicap, date, odd: (sheet.superior == 1 || lineType == '主队') ? home : away }
                }

                let odds = [];
                for (let index = 0; index < all_datas.handicaps.length; index++) {
                    const sheet = all_datas.handicaps[index];
                    if (need_companies.indexOf(sheet.company_id) >= 0) {
                        let odd = getOdds(sheet);
                        if (odd) {
                            let dom = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${chart_color[need_companies.indexOf(parseInt(sheet.company_id))]};"></span> ${sheet.company} [${odd.handicap}]${odd.odd}/${(sheet.superior == 1 || lineType == '主队') ? odd.away : odd.home}`
                            odds.push(dom);
                        }
                    }
                }
                tooltip_data[time] = odds;
                return odds;
            }

            function handlerData (company) {
                let datas = [];
                let all_time = company.all_shifts_time;
                let all_odds = (company.superior == 1 || lineType == '主队') ? company.all_shifts_home : company.all_shifts_away;
                for (let index = 0; index < company.all_shifts_time.length; index++) {
                    let home = all_odds[index];
                    let date = new Date(all_time[index]);
                    datas.push([date, home]);
                }
                return datas
            }

            var series = [];
            var legend = [];
            for (let index = 0; index < all_datas.handicaps.length; index++) {
                const sheet = all_datas.handicaps[index];
                if (need_companies.indexOf(sheet.company_id) >= 0) {
                    var name = company_ids[sheet.company_id];
                    sheet.company = name;
                    legend.push(name);
                    series.push({
                        name,
                        type: 'line',
                        color: chart_color[need_companies.indexOf(parseInt(sheet.company_id))],
                        showAllSymbol: true,   // 显示symbol
                        data: handlerData(sheet)
                    })
                }
            }

            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },
                    formatter: function (params) {
                        let series = params[0];
                        let data = getCutOdds(series.axisValue);
                        return [series.axisValueLabel, ...data].join("<br/>");
                    }
                },
                legend: {
                    data: legend,
                    selected: legend_selected
                },
                xAxis:
                {
                    type: 'time',
                    axisPointer: {
                        label: {
                            formatter: function (params) {
                                return moment(params.value).format('MM-DD HH:mm') + '【' + dateCompare(gameData.begin_time, new Date(params.value), 'mm') + '】';
                            }
                        }
                    }
                },
                dataZoom: [{
                    type: 'inside',
                    filterMode: 'none',
                }, {
                    filterMode: 'none',
                    handleSize: '100%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                yAxis: [{
                    type: 'value',
                    scale: true,
                }],
                series: series,
                axisPointer: {
                    label: {
                        backgroundColor: '#666'
                    }
                },
            };
            myChart.setOption(option);
        }
    }

    function showEuChart () {

        var euChart;
        var hsDetail = new Hashtable();
        var games = new Hashtable();

        $.getScript(`http://1x2.nowscore.com/${getQueryString('id')}.js`, function (res) {
            if (typeof (gameDetail) != "undefined") {
                $('#euchart').height('500px');

                euChart = echarts.init(document.getElementById('euchart'));

                for (let i = 0; i < game.length; i++) {
                    var d_data = game[i].split('|');
                    var companyId = parseInt(d_data[0]);
                    if (!games.contains(companyId)) {
                        games.add(companyId, d_data);
                    }
                }
                for (var i = 0; i < gameDetail.length; i++) {
                    var g_data = gameDetail[i].split('^');
                    var oddsID = parseInt(g_data[0]);
                    if (!hsDetail.contains(oddsID)) {
                        hsDetail.add(oddsID, g_data[1]);
                    }
                }

                var odds = games.items(90);
                var oddsDetail = hsDetail.items(odds[1]);
                loadChart(oddsDetail.split(';'));
            }
        });

        function loadChart (od) {

            function handlerData () {
                let datas = [];
                for (let index = 0; index < od.length; index++) {
                    const odd = od[index].split('|');
                    if (odd.length > 5) {
                        var date = new Date(season + '-' + odd[3]);
                        datas.push([date, odd[0]]);
                    }
                }
                return datas;
            }

            var series = [];
            var legend = [];

            legend.push('易胜博');
            series.push({
                name: '易胜博',
                type: 'line',
                showAllSymbol: true,   // 显示symbol
                data: handlerData()
            })

            var option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: legend,
                },
                xAxis:
                {
                    type: 'time',
                    axisPointer: {
                        // label: {
                        // formatter: function (params) {
                        // return moment(params.value).format('MM-DD HH:mm') + '【' + dateCompare(game.begin_time, new Date(params.value), 'mm') + '】';
                        // }
                        // }
                    }
                },
                dataZoom: [{
                    type: 'inside',
                    filterMode: 'none',
                }, {
                    filterMode: 'none',
                    handleSize: '100%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
                yAxis: [{
                    type: 'value',
                    scale: true,
                }],
                series: series,
                axisPointer: {
                    label: {
                        backgroundColor: '#666'
                    }
                },
            };
            euChart.setOption(option);
        }

    }

    //处理水位详情
    if (location.pathname.startsWith('/changeDetail')) handleOdds();
    //处理公司位置
    if (location.pathname.startsWith('/AsianOdds_n')) handleCompany();
    if (location.pathname.indexOf('OddsHistory') > 0) handleHistory();

})();

function Hashtable () {
    this._hash = new Object();
    this.add = function (key, value) {
        if (typeof (key) != "undefined") {
            this._hash[key] = typeof (value) == "undefined" ? null : value;
            return true;
        }
        else
            return false;
    }
    this.remove = function (key) { delete this._hash[key]; }
    this.keys = function () {
        var keys = new Array();
        for (var key in this._hash) {
            keys.push(key);
        }
        return keys;
    }
    this.count = function () { var i = 0; for (var k in this._hash) { i++; } return i; }
    this.items = function (key) { return this._hash[key]; }
    this.contains = function (key) {
        return typeof (this._hash[key]) != "undefined";
    }
    this.clear = function () { for (var k in this._hash) { delete this._hash[k]; } }
}
