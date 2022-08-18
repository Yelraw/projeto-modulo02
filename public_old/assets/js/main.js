function navegarParaDiv(id){
    $('html, body').animate({   
        scrollTop: $(id).offset().top
    }, 'slow');
}

$("#navbarNav > ul > li > a").on('click', function(e){
    var link = $(this).attr('href');
    if(!link.startsWith('http')){
        e.preventDefault();
        navegarParaDiv(link);
    }else{

    } 
});