function listarProdutos(prod){
    if(prod.data().foto_destaque != "" && prod.data().foto_destaque != null){
        var foto = prod.data().foto_destaque
    }else{
        var foto = "./assets/img/no-image.png"
    }
    var produto = `<div pesquisa-autor="${prod.data().autor_fabricante.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}" 
                        pesquisa-nome="${prod.data().nome.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}" 
                        class="col col-lg-3 col-12 produto">
                        <div class="card text-center" style="width: 100%;">
                            <h5 class="card-title">${prod.data().nome}</h5>
                            <img src="${foto}" class="card-img-top" alt="...">
                            <div class="card-body">
                                    <p class="card-text">${prod.data().descricao}</p>
                                    <p class="card-text">${prod.data().preco_venda}</p>
                                    <a href="#" class="btn btn-primary btn_laranja">Comprar</a>
                            </div>
                        </div>
                    </div>`;
    $("#lista_produtos").append(produto);                
}

function buscarProdutos(){
    firebase.firestore().collection("produtos").get().then(
        function(produtos){
            for(i=0; i< produtos.docs.length; i++){
                listarProdutos(produtos.docs[i]);
            }
        }
        )

   /* for(let produto of produtos){
        listarProdutos(produto);
    }*/
    
   /* $.each(produtos, function(){
        listarProdutos(this);
    }); */
}

function pesquisarProdutos(){
    var pesquisaPorNome = $('#pesquisa_nome_livro').val().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    var pesquisaPorAutor = $('#pesquisa_autor_livro').val().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if(pesquisaPorNome == "" && pesquisaPorAutor== ""){
        Swal.fire({icon: "error", title: "Informe o produto!"});
        $('.produto').show();
    }else if(pesquisaPorAutor == ""){
        $('.produto').hide();
        $('[pesquisa-nome*= "'+pesquisaPorNome+'"]').show();
    }else if(pesquisaPorNome == ""){
        $('.produto').hide();
        $('[pesquisa-autor*= "'+pesquisaPorAutor+'"]').show();
    }
}

$(document).ready(function(){
    buscarProdutos();
});
