const menu_btn=document.getElementById('menu_btn');
const close_btn=document.getElementById('close_btn');
const menu=document.getElementById('menu');

function showMenu(e){

     if(e.name =='menu'){
        close_btn.hidden=false;
        menu_btn.hidden=true;
        menu.hidden=false;
        
     }
     else{
        close_btn.hidden=true;
        menu_btn.hidden=false;
        menu.hidden=true;
     }
}