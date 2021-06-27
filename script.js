$(function(){
  /* 預設頁數以及排序方式 */
  let target=1, order_option=1;
  let contryJson= new Array();

  fetch('https://restcountries.eu/rest/v2/all')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    contryJson=myJson;
    $.each( contryJson ,function(index,infos){
      let tr_temp='';

      tr_temp+='<tr class="item" style="display:none;" cy_name="'+infos['name']+'" display="1">';
      tr_temp+='<th scope="row">'+(index+1)+'</th>';
      tr_temp+='<td><img width="150px" height="100px" src="'+infos['flag']+'"></img></td>';
      tr_temp+='<td><a style="cursor: pointer;" data-toggle="modal" data-target="#exampleModal">'+infos['name']+'</a></td>';
      tr_temp+='<td>'+infos['alpha2Code']+'</td>';
      tr_temp+='<td>'+infos['alpha3Code']+'</td>';
      tr_temp+='<td>'+infos['nativeName']+'</td>';
      tr_temp+='<td>'+infos['altSpellings']+'</td>';
      tr_temp+='<td>'+infos['callingCodes']+'</td>';
      tr_temp+='</tr>';

      $('#show_list').append(tr_temp);
    });

    /* 預設國家顯示 */
    show_item(target,contryJson.length);

    /* 分頁處理 */
    show_page_list(contryJson.length)

    $('.page_li').on('click',function(){
      /* 有更改頁數才會執行 */
      if( target!=$(this).attr('data-page') ){
        /* 更改active */
        $('.page_li').removeClass('active');
        $(this).addClass('active');
        /* 指定頁數 */
        target=$(this).attr('data-page');
        show_item(target,contryJson.length);
      }
    })

    $('a[data-toggle="modal"]').on('click', function(){
      let cy_name=$(this).html().toString().replace(' ','%20');
      $('#exampleModal div.modal-body').empty().html('<p>請稍後</p>');

      fetch('https://restcountries.eu/rest/v2/name/'+cy_name)
      .then(function(response2) {
        return response2.json();
      })
      .then(function(myJson2) {
        let temp_infos='';
        $.each(myJson2[0] , function(i,e){
          temp_infos+='<p>'+i+'：'+e+'</p>';
        });

        $('#exampleModal div.modal-body').empty().html(temp_infos);
      });

    });
  });

  $('#orderRows').on('change',function(){
    /* 預設排序也是1 */
    let new_order=1;
    let item_num=contryJson.length; // 資料總筆數
    if( $(this).val()==2 ) new_order=2;
    /* 有更改排序才會執行 */
    if( order_option!=new_order ){
      /* 更改排序 */
      order_option=new_order;
      /* 原本已經排序過,使用從頭尾交換 */
      for( let i=0 ; i<item_num ; i++ ){
        let j=(item_num-1)-i;

        /* 交換完成條件 */
        if( j<=i ) {
          break;
        }
        /* 進行交換 */
        let $li1=$("#show_list .item").eq(i);
        let cy_name1=$li1.attr('cy_name');
        let display1=$li1.attr('display');
        let $li2=$("#show_list .item").eq(j);
        let cy_name2=$li2.attr('cy_name');
        let display2=$li2.attr('display');
        let $li_temp;
        $li1.attr('cy_name',cy_name2);
        $li2.attr('cy_name',cy_name1);
        $li1.attr('display',display2);
        $li2.attr('display',display1);
        $li_temp=$li1.html();
        $li1.html($li2.html());
        $li2.html($li_temp);

      }

      show_item(target,contryJson.length);
    }
  })

  $('#search_input_all').on('keyup',function(){
    let item_count=0;
    /* 模糊查詢 */
    if( $('#search_input_all').val()!='' ){
      $.each($("#show_list .item"),function(){
        if( $(this).attr('cy_name').indexOf($('#search_input_all').val()) >= 0 ){
          $(this).attr('display','1');
          item_count++;
        }
        else{
          $(this).attr('display','0');
        }
      })

      /* 分頁處理 */
      show_page_list(item_count);
    }
    else{
      $("#show_list .item").attr('display','1');
      /* 分頁處理 */
      show_page_list(contryJson.length);
    }
    target=1;

    $('.page_li').on('click',function(){
      /* 有更改頁數才會執行 */
      if( target!=$(this).attr('data-page') ){
        /* 更改active */
        $('.page_li').removeClass('active');
        $(this).addClass('active');
        /* 指定頁數 */
        target=$(this).attr('data-page');
        show_item(target,contryJson.length);
      }
    })

    show_item(target,contryJson.length);
  })


})

//每頁資料數
function get_list_num(){
  return 25;
}

/* 分頁顯示 */
function show_page_list(items_count){
  /* 分頁計算 */
  let list_num=get_list_num();//每頁資料數
  let total_page_temp = items_count / list_num;
  let total_page = Math.ceil(total_page_temp);
  let page='';
  
  for( let i=1 ; i<=total_page ; i++ ){
    page+='<li data-page="'+i+'" class="page_li ';
    page+=(i==1)?'active':'';
    page+='">';
    page+='<span>'+i+'<span class="sr-only">(current)</span></span>';
    page+='</li>';
  }
  $('.pagination').empty().append(page)
}

/* 顯示item function */
function show_item(page,total){
  /* 首先將全部hide */
  $('.item').hide();
  let list_num=get_list_num(); // 每頁資料數
  let start=(page-1)*list_num; // 顯示的比數
  let $li=$("#show_list .item[display=1]").eq(start);
  let show_count=0;// 已搜尋多少項目

  /* 包括當前元素往下25個都要顯示 */
  for( let i=0 ; i<list_num ; i++ ){
    if( $li.attr('display')=='1'){
      $li.show();
    }
    else{
      i--;
    }
      
    $li=$li.next();
    show_count++;
    if( show_count>total ) break;
  }
}