function iniciarCarouselNovidades(){
    $('.owl-carousel').owlCarousel({
        items:4,
        lazyLoad:true,
        loop:true,
        dots:true,
        margin:20,
        responsiveClass:true,
            responsive:{
                0:{
                    items:1,
                },
                600:{
                    items:2,
                },
                1000:{
                    items:4,
                }
            }
    });
}

function buscarNovidades(){
    firebase.firestore().collection("produtos").where("deletado", "==", false)
    .orderBy("cadastrado_em", "desc").limit(8).get().then(function (produtos){
        $.each(produtos.docs, function(){
            adicionarNovidade(this);
        });
        iniciarCarouselNovidades();
    }).catch(function(e){
        console.log(e);
    })
}

function adicionarNovidade(produto){
    if(produto.data().foto_destaque != null && produto.data().foto_destaque != ""){
        var foto = produto.data().foto_destaque;
    }else{
        var foto = "../assets/images/no-image.png";
    }
    if(produto.data().nome.length > 40){
        var ret = "...";
    }else{
        var ret = "";
    }
    
    var precoOriginal = produto.data().preco_venda;
    if(produto.data().desconto && produto.data().desconto > 0){
        var precoDesconto = ((precoOriginal / 100) * produto.data().desconto);
        var precoComDesconto = precoOriginal - precoDesconto;
        var preco = `<span style="font-size: 20px;">
                        R$ ${precoComDesconto.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </span>
                    <span style="text-decoration: line-through; color:red; font-size: 12px">
                        R$ ${precoOriginal.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                    </span>
                    `
    }else{
        preco = "R$ " + precoOriginal.toLocaleString('pt-br', { minimumFractionDigits: 2 });
    }

    var htmlNovidade = `
    <a href="./produto.html?cod=${produto.id}">
        <div class="featured-item text-center">
            <img class="mx-auto text-center" style="max-height: 220px; height 220px; width: auto;" src="${foto}">
            <div class="container_titulo">
                <h4>${produto.data().nome.substr(0, 40)}${ret}</h4>
            </div>
            <h6 style="font-size: 20px">${preco}</h6>
        </div>
    </a>
  `;
    $('#novidades_produtos').append(htmlNovidade);
}

function pesquisarProduto(){
    var pesquisaCript = encodeURI($('#campo_pesquisa').val());
    window.location.href = "./busca.html?por=" + pesquisaCript;
}

//função pra possibilitar pesquisar com enter
document.querySelector('#campo_pesquisa').addEventListener('keypress', function (tecla) {
    if (tecla.key == 'Enter') {
        tecla.preventDefault();
        pesquisarProduto();
    }
});

$(document).ready(function(){
    buscarNovidades();
})