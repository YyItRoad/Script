// ==UserScript==
// @name         time_diff
// @namespace    http://boc.ink/
// @version      0.2
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
    function diffArray(arr1, arr2) {
        return arr1.concat(arr2).filter(item => !arr1.includes(item)||!arr2.includes(item));
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

    const company_names = ['澳门','易胜博','利记','明陞','12bet','Crown','金宝博','盈禾','韦德','平博','Bet365','10BET','18Bet'];

    function handleCompany () {
        console.log('handleCompany');
        var companies = {};
        var trs = $('#odds tr');
        let last_name,last_array;
        for (var i = 2;i < trs.length;i++) {
            let name = $(trs[i]).find('td').first().text().trim();
            if (name.startsWith('最')) continue;
            if (name.length > 0 && name !== last_name) {
                last_name = name;
                last_array = [trs[i]];
                companies[name] = last_array;
            }else {
                last_array = companies[last_name];
                last_array.push(trs[i]);
            }
        }
        let all_companies = company_names.concat(diffArray(Object.keys(companies),company_names));
        let first_td;
        for (let j =0;j < all_companies.length; j++){
            let htmls = companies[all_companies[j]];
            for (let k =0; k < htmls.length;k ++) {
              if (!first_td) {
                 first_td = htmls[k];
              }else {
                 first_td.before(htmls[k]);
              }
            }
        }
        $('#odds tr:nth-child(2)').after(first_td);
    }

    function handleHistory() {
        console.log('handleHistory');
        var tds = $('#odds > table tr td.font12');
        let last_date;
        for (var i = 0;i < tds.length; i++) {
          var date =textToDate($(tds[i]).text().replace('(初盘)',''));
            if (last_date) {
               $(tds[i-1]).text($(tds[i-1]).text() + " [" + diffMinutes(date,last_date)+']');
            }
            last_date = date;
        }

    }
    if (location.pathname.startsWith('/changeDetail')) handleOdds();
    if (location.pathname.startsWith('/AsianOdds_n')) handleCompany();
    if (location.pathname.indexOf('OddsHistory')>0) handleHistory();

})();
