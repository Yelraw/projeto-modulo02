$(document).ready(function(){
    $("#celular").mask('(99) 99999-9999');
    $("#cep").mask('99999-999');
    $("#cpf").mask('999.999.999-99');
    
    $("#cep").on('change', function(){
        var cep = $("#cep").val().replace("-", "");
        var urlApiCep = "https://viacep.com.br/ws/" + cep + "/json/?callback=?";
        $.getJSON(urlApiCep, function (resultado) {
            if (!("erro" in resultado)) {
                $("#logradouro").val(resultado.logradouro).prop('disabled', true);
                $("#bairro").val(resultado.bairro).prop('disabled', true);
                $("#cidade").val(resultado.localidade).prop('disabled', true);
                $("#estado").val(resultado.uf).prop('disabled', true);
            } else {
                new Swal("Erro!", "Não foi possível buscar este CEP", "error");
            }
        })
    });
    firebase.auth().onAuthStateChanged(function(usuarioLogado){
        if(usuarioLogado){ 
            buscarClientes();
            $('#navbarDropdownMenuLink').html(usuarioLogado.email);
            $('#load').hide();
        }else{
            location.href = "./index.html";
        }
    })
})

function buscarClientes(){
    firebase.firestore().collection("login").orderBy("nome").get().then(function(resultado){
        for(let cliente of resultado.docs){
            $("#lista_clientes").append(` 
                <tr>
                    <td>${cliente.data().cpf ? cliente.data().cpf : "Não disponível"}</td>
                    <td>${cliente.data().nome}</td>
                    <td>${cliente.data().cidade ? cliente.data().cidade : "Não disponível"} - 
                    ${cliente.data().estado ? cliente.data().estado : "Não disponível"}</td>
                    <td>${cliente.data().celular} <br> ${cliente.data().email ? cliente.data().email : "Não disponível"}</td> 
                    <td><i onclick="editarCliente('${cliente.id}')" class="fas fa-edit"></i></td>     
                </tr>
            `)
        }
        $('#tabela_clientes').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Portuguese-Brasil.json"
            }
        })
    })
}

function novoCliente(){
    window.idClienteParaEditar = null;
    $("#modal_cadastro").find("input").val("");
    $("#modal_cadastro").modal("show");
}

function editarCliente(idCliente){
    firebase.firestore().collection("login").doc(idCliente).get().then(function(dadosCliente){
        window.idClienteParaEditar = idCliente;
        $("#nome").val(dadosCliente.data().nome ? dadosCliente.data().nome : "");
        $("#cpf").val(dadosCliente.data().cpf ? dadosCliente.data().cpf : "");
        //$("#data_nascimento").val(dadosCliente.data().data_nascimento ? dadosCliente.data().data_nascimento : "");
        $("#celular").val(dadosCliente.data().celular ? dadosCliente.data().celular : "");
        $("#email").val(dadosCliente.data().email ? dadosCliente.data().email : "");
        $("#cep").val(dadosCliente.data().cep ? dadosCliente.data().cep : "");
        $("#logradouro").val(dadosCliente.data().logradouro ? dadosCliente.data().logradouro : "");
        $("#numero").val(dadosCliente.data().numero ? dadosCliente.data().numero : "");
        $("#complemento").val(dadosCliente.data().complemento ? dadosCliente.data().complemento : "");
        $("#bairro").val(dadosCliente.data().bairro ? dadosCliente.data().bairro : "");
        $("#cidade").val(dadosCliente.data().cidade ? dadosCliente.data().cidade : "");
        $("#estado").val(dadosCliente.data().estado ? dadosCliente.data().estado : "");
        $("#modal_cadastro").modal('show');
    })
}

function gravarCliente(dadosCliente){
    var gravacaoCliente = firebase.firestore().collection("clientes");
    if(window.idClienteParaEditar != null){
        gravacaoCliente.doc(window.idClienteParaEditar).set(dadosCliente, {merge: true}).then(function(){
            gravadoComSucesso();
        })
    }else{
        gravacaoCliente.add(dadosCliente).then(function(){
            gravadoComSucesso();
        })
    }
}

function salvarCliente(){
    var camposObrigatorios = false;
    $('.obrigatorio').each(function () {
        if ($(this).val() == "") {
            camposObrigatorios = true;
        }
    })

    if (camposObrigatorios) {
        new Swal("Atenção!", 'Por favor preencha todos os campos com "*" para prosseguir', "warning");
        return;
    }

    var cliente = {
        nome: $("#nome").val(),
        cpf: $("#cpf").val(),
        //data_nascimento: $("#data_nascimento").val(),
        celular: $("#celular").val(),
        email: $("#email").val(),
        cep: $("#cep").val(),
        logradouro: $("#logradouro").val(),
        numero: $("#numero").val(),
        complemento: $("#complemento").val(),
        bairro: $("#bairro").val(),
        cidade: $("#cidade").val(),
        estado: $("#estado").val()
    }
    gravarCliente(cliente);
}

function gravadoComSucesso(){
    new Swal({
        title: "Cocluído!",
        icon: "success",
        text: "Cliente salvo com sucesso!"
    }).then(function(){
        location.reload();
    })
}
