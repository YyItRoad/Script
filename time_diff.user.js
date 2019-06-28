// ==UserScript==
// @name         time_diff
// @namespace    http://boc.ink/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://vip.win007.com/changeDetail/handicap.aspx*
// @match        *://vip.win0168.com/changeDetail/handicap.aspx*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
// @grant        none
// ==/UserScript==

;(function() {
    'use strict';
    console.log('时间差插件!!!',location.host);
    var begin_time = textToDate($('table tr td[bgcolor="red"]').parents('tr>td+td+td').parent().first().find('td').html());
    console.log('begin_time:',begin_time.format());
    //转化为日期对象
    function textToDate(text) {
       return moment(text, "MM-DD HH:mm");
    }
    function diffMinutes(m,b) {
        return (b?b:begin_time).diff(m,'minutes');
    }
    function formatHour(mm) {
        if (mm < 60) return mm + 'm';
        return (parseInt(mm/60) + (mm%60/60)).toFixed(1) + 'h';
    }
    function diffOdds(a,b) {
        return parseInt(b * 100 - a * 100);
    }

    var oddsTable = "table[cellspacing='1'] tr";
    var lists =  $(oddsTable);
    var date_index = $(oddsTable + ":nth-child(1) td").length -1;
    $(oddsTable + ":nth-child(1)" + " td:nth-child(" + date_index + ")").attr('width',160);

    var last_date,last_home;
    for(var i = 2; i<= lists.length;i++) {
       var date_sel = oddsTable + ":nth-child(" +i +")" + " td:nth-child(" + date_index + ")";
       var state_str = $(oddsTable + ":nth-child(" +i +")" + " td.hg_blue").text();
       var home_sel = oddsTable + ":nth-child(" +i +")" + " td:nth-child(" + (date_index - 3) + ")";
       var pre_home_sel = oddsTable + ":nth-child(" + (i - 1) +")" + " td:nth-child(" + (date_index - 3) + ")";
        if (state_str == '滚') {
            $(oddsTable + ":nth-child(" +i +")").hide();
            continue
        };
       var date_str = $(date_sel).text();
       var date_odd = textToDate(date_str);
       var home_odd = $(home_sel).text();
       var diff_begin = formatHour(diffMinutes(date_odd));
        if (last_date) {
            diff_begin = diff_begin + "[" + diffMinutes(date_odd,last_date) + "]";
        }
        if (last_home != undefined) {
           $(pre_home_sel).find('b').text($(pre_home_sel).text() + ' | ' + diffOdds(home_odd,last_home));
        }
       last_date = date_odd;
       last_home = home_odd;
       $(date_sel).text(date_str +' | '+ diff_begin);
    }
})();
