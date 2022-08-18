function enviarMensagem(){
    var text = "";
    text += `*Nome Completo:* ${$("#contato_nome").val()}%0a`;
    text += `*E-mail:* ${$("#contato_email").val()}%0a`;
    text += `*Assunto:* ${$("#contato_assunto").val()}%0a%0a`;
    text += `*Mensagem:* ${$("#contato_mensagem").val()}%0a`;
    location.href = "https://wa.me/5562991175391?&text=" + text
}