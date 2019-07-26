// ==UserScript==
// @name         time_diff
// @namespace    http://boc.ink/
// @version      0.3.1
// @description  try to take over the world!
// @author       YY
// @match        *://vip.win007.com/changeDetail/handicap.aspx*
// @match        *://vip.win0168.com/changeDetail/handicap.aspx*
// @match        *://vip.win0168.com/AsianOdds_n.aspx*
// @match        *://vip.win007.com/AsianOdds_n.aspx*
// @match        *://vip.win0168.com/1x2/OddsHistory.aspx*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
// @grant        none
// ==/UserScript==

; (function () {
    'use strict';
    console.log('时间差插件!!!', location.host, location.pathname);
    var begin_time;
    //转化为日期对象
    function textToDate(text) {
        return moment(text, "MM-DD HH:mm");
    }
    function diffMinutes(m, b) {
        return (b ? b : begin_time).diff(m, 'minutes');
    }
    function formatHour(mm) {
        if (mm < 60) return mm + 'm';
        return (parseInt(mm / 60) + (mm % 60 / 60)).toFixed(1) + 'h';
    }
    function diffOdds(a, b) {
        return (b * 100 - a * 100).toFixed(0);
    }
    function diffArray(arr1, arr2) {
        return arr1.concat(arr2).filter(item => !arr1.includes(item) || !arr2.includes(item));
    }

    function handleOdds() {
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

    const company_names = ['澳门', '易胜博', '利记', '明陞', '12bet', 'Crown', '金宝博', '盈禾', '韦德', '平博', 'Bet365', '10BET', '18Bet'];

    function handleCompany() {
        console.log('handleCompany');
        var companies = {};
        var trs = $('#odds tr');
        let last_name, last_array;
        for (var i = 2; i < trs.length; i++) {
            let name = $(trs[i]).find('td').first().text().trim();
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
        let all_companies = company_names.concat(diffArray(Object.keys(companies), company_names));
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
            showChart(key);
        }
    }

    function handleHistory() {
        console.log('handleHistory');
        var tds = $('#odds > table tr td.font12');
        let last_date;
        for (var i = 0; i < tds.length; i++) {
            var date = textToDate($(tds[i]).text().replace('(初盘)', ''));
            if (last_date) {
                $(tds[i - 1]).text($(tds[i - 1]).text() + " [" + diffMinutes(date, last_date) + ']');
            }
            last_date = date;
        }
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    function showChart(key) {

        function heredoc(fn) {
            return fn.toString().split('\n').slice(1, -1).join('\n') + '\n'
        }
        var content = heredoc(function () {/*
        <div id='chart' style="width:100%;height:500px;padding-top:10px">

        </div>
        */});

        $.getScript('http://raw.githack.com/YyItRoad/Script/master/echarts.min.js', getData);


        const need_companies = [1, 3, 12, 17, 24, 23, 31, 35];
        const chart_color = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];// ['#FF0000', '#FFFF00', '#008B8B', '#7FFFD4', '#FFFAFA', '#0000FF', '#8A2BE2', '#A52A2A', '#000000', '#7FFF00', '#80000040', '#FF7F50', '#6495ED', '#DC143C', '#00FFFF', '#B8860B', '#A9A9A9', '#006400', '#FFDAB9', '#8B008B', '#FF00FF', '#483D8B', '#2F4F4F', '#D2B48C'];
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

        function getData() {
            $.ajax({
                type: "get",
                url: `https://boc.ink/v1/game/targets?key=${key}&fun=detail&id=${getQueryString('id')}`,
                success: function (res) {
                    console.log(res);
                    if (res.data) {
                        $('#MiddleAd').height(525);
                        $('#MiddleAd').append(content);
                        loadChart(res.data);
                    }
                }
            });
        }

        var tooltip_data = {};
        var game;
        var legend_selected = JSON.parse(localStorage.getItem('legend_selected'));

        function loadChart(all_datas) {
            myChart = echarts.init(document.getElementById('chart'));
            myChart.on('legendselectchanged', function (params) {
                localStorage.setItem('legend_selected', JSON.stringify(params.selected));
            });

            game = all_datas;
            function getCutOdds(time) {
                if (tooltip_data[time]) {
                    return tooltip_data[time];
                  }
                function getOdds(sheet) {
                    let all_time = sheet.all_shifts_time;
                    let all_home = sheet.all_shifts_home;
                    let all_away = sheet.all_shifts_away;
                    let all_handicap = sheet.all_shifts_handicap;
                    let home, away, handicap, date;
                    for (let index = all_time.length -1; index >= 0 ; index--) {
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
                    return home != undefined && { home, away, handicap, date, odd: sheet.superior == 1 ? home : away }
                }

                let odds = [];
                for (let index = 0; index < all_datas.handicaps.length; index++) {
                    const sheet = all_datas.handicaps[index];
                    if (need_companies.indexOf(sheet.company_id) >= 0) {
                        let odd = getOdds(sheet);
                        if (odd) {
                            let dom = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${chart_color[need_companies.indexOf(parseInt(sheet.company_id))]};"></span> ${sheet.company} [${odd.handicap}]${odd.odd}/${sheet.superior == -1 ? odd.home : odd.away}`
                            odds.push(dom);
                        }
                    }
                }
                tooltip_data[time] = odds;
                return odds;
            }

            function dateCompare(date1, date2, toType = 'ss') {
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

            function handlerData(company) {
                let datas = [];
                let all_time = company.all_shifts_time;
                let all_odds = company.superior == 1 ? company.all_shifts_home : company.all_shifts_away;
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
                                return moment(params.value).format('MM-DD HH:mm') + '【' + dateCompare(game.begin_time, new Date(params.value), 'mm') + '】';
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

    if (location.pathname.startsWith('/changeDetail')) handleOdds();
    if (location.pathname.startsWith('/AsianOdds_n')) handleCompany();
    if (location.pathname.indexOf('OddsHistory') > 0) handleHistory();

})();
