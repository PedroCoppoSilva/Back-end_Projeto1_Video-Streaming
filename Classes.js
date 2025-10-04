class Usuario{
  constructor(id, nome, email, senha){
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
  }
}

class Video{
  constructor(id, titulo, descricao, url, idUsuario, dataUpload, tempo){
    this.id = id;
    this.titulo = titulo;
    this.descricao = descricao;
    this.url = url;
    this.idUsuario = idUsuario;
    this.dataUpload = dataUpload;
    this.tempo = tempo;
  }
}

class Comentario{
  constructor(id, texto, idUsuario, idVideo, data){
    this.id = id;
    this.texto = texto;
    this.idUsuario = idUsuario;
    this.idVideo = idVideo;
    this.data = data;
  }
}
