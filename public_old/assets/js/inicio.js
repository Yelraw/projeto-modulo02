window.produtoId = null;

function novoProduto(){
    $("#modal_produto").find("input").val("");
    $("#modal_produto").find("textarea").val("");
    $("#modal_produto").find("img").attr("src", "");
    $('#modal_produto').modal('show');
    window.produtoId = null;
}

function buscarProdutos(){
    firebase.firestore().collection('produtos').where("deletado", "==", false).get().then(function(produtos){
        for(let produto of produtos.docs){
            addProdutosNaTabela(produto);
        }
        $("#tabela_produtos").DataTable();
    })
}

function addProdutosNaTabela(prod){
    $('#lista_produtos').append(`
        <tr>
            <td>${prod.id}</td>
            <td>${prod.data().nome}</td>
            <td>${prod.data().preco_venda.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td>${prod.data().preco_compra.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
            <td><a class="icone_editar"><i class="fas fa-edit pr-2" onclick="editarProduto('${prod.id}')"></i>
                </a> <a class="icone_excluir"><i class="fas fa-trash" onclick="excluirProduto('${prod.id}')"></i></a></td>
        </tr>
    `);
}

function editarProduto(idProduto){
    window.produtoId = idProduto;
    firebase.firestore().collection("produtos").doc(idProduto).get().then(function(produto){
        $('#produto_nome').val(produto.data().nome);
        $('#produto_autor_fabricante').val(produto.data().autor_fabricante);
        $('#produto_descricao').val(produto.data().descricao);
        $('#produto_preco_venda').val(produto.data().preco_venda.toLocaleString('pt-BR', {minimumFractionDigits: 2}));
        $('#produto_preco_compra').val(produto.data().preco_compra.toLocaleString('pt-BR', {minimumFractionDigits: 2}));
        $('#produto_desconto').val(produto.data().desconto);
        $('#produto_qtd_estoque').val(produto.data().qtd_estoque);
        if(produto.data().foto_destaque != null && produto.data().foto_destaque != ""){
            $('#img_produto').attr('src', produto.data().foto_destaque);
        }else{
            $('#img_produto').attr('src', "../assets/img/no-image.png");
        }
        $('#modal_produto').modal("show");
    })
}

function salvarProduto(){
    var objProduto = { 
        nome: $('#produto_nome').val(),
        autor_fabricante: $('#produto_autor_fabricante').val(),
        descricao: $('#produto_descricao').val(),
        preco_venda: parseFloat($('#produto_preco_venda').val().replace(/\./g, "").replace(",", ".")),
        preco_compra: parseFloat($('#produto_preco_compra').val().replace(/\./g, "").replace(",", ".")),
        desconto: parseFloat($('#produto_desconto').val()),
        qtd_estoque: parseInt($('#produto_qtd_estoque').val()),
        deletado: false,
        ultima_alteracao: new Date()
    }
    if($("#produto_nome").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Nome Produto" para continuar!', 'error');
        return;
    }
    if($("#produto_autor_fabricante").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Autor/Fabricante" para continuar!', 'error');
        return;
    }
    if($("#produto_descricao").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Descrição" para continuar!', 'error');
        return;
    }
    if($("#produto_preco_venda").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Preço Venda" para continuar!', 'error');
        return;
    }
    if($("#produto_qtd_estoque").val() == ""){
        new Swal("Atenção", 'Por favor preencha o campo "Qtd. Estoque" para continuar!', 'error');
        return;
    }
    if($("#produto_foto_destaque").val() == "" && window.produtoId == null){
        new Swal("Atenção", 'Por favor preencha o campo "Foto/Banner de destaque" para continuar!', 'error');
        return;
    }
    if($('#produto_foto_destaque').val() != ""){
        $('#load').show();
        var minhaFoto = document.getElementById('produto_foto_destaque').files[0];
        var horaAtual = new Date().getTime();
        var nomeFoto = horaAtual + minhaFoto.name;

        var servicoStorage = firebase.storage().ref().child("fotos_produtos/" + nomeFoto).put(minhaFoto);
            servicoStorage.on('state_changed',
            function(estadoEnvio){
                //todo Tratar a % do envio aqui
            },
            function(error){
                $('#load').hide();
                console.log(error);
                new Swal("Ops Algo deu errado!", "Ocorreu um erro ao salvar a foto", "error");
            },
            function(resultado){
                $('#load').hide();
                $('#modal_produto').modal("hide");
                servicoStorage.snapshot.ref.getDownloadURL().then(function(urlFoto){
                    objProduto.foto_destaque = urlFoto;
                    gravarProduto(objProduto);
                })
            }

        )
    }else{
        gravarProduto(objProduto);
    }
    
}

function gravarProduto(objProduto){
    if(window.produtoId != null){
        objProduto.ultima_alteracao = new Date();
        firebase.firestore().collection("produtos").doc(window.produtoId).set(objProduto, {merge: true}).then(function(){
            Swal.fire({
                title: 'Produto Editado com Sucesso!',
                icon: 'success',
                confirmButtonColor: '#ff6d12'
              }).then(() => {
                location.reload();
            })
        })
    }else{
        objProduto.cadastrado_em = new Date();
        firebase.firestore().collection("produtos").add(objProduto).then(function(resultado){
            Swal.fire({
                title: 'Produto Cadastrado com Sucesso!',
                text: 'Id do produto: '+ resultado.id,
                icon: 'success',
                confirmButtonColor: '#ff6d12'
              }).then(() => {
                location.reload();
            })
        })
    }
}

function excluirProduto(idProduto){
    objProduto = {deletado: true}
    Swal.fire({
        title: 'Tem certeza que deseja excluir este produto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, deletar!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
            firebase.firestore().collection('produtos').doc(idProduto).set(objProduto, {merge: true}).then(function(){
                Swal.fire({
                    title: 'Deletado com sucesso!',
                    icon: 'success',
                    confirmButtonColor: '#ff6d12'
                  }).then(()=>{
                        location.reload();
                  })
            })
            
        }
      })
}

$(".mascara_dinheiro").mask('000.000.000.000.000,00', {reverse: true});

$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(usuarioLogado){
        if(usuarioLogado){
            buscarProdutos(); 
            $('#navbarDropdownMenuLink').html(usuarioLogado.email);
            $('#load').hide(); 
        }else{
            location.href = "./index.html";
        }
    })
});

