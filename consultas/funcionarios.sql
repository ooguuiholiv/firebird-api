SELECT
      fcfo.nomefantasia as nome_completo,
      fcfo.cgccfo as cpf,
      fcfo.inscrestadual as identidade,
      fcfo.telefone,
      fcfo.campoalfa1 as funcao,
      fcfo.dataop1 as admissao,
      fcfo.dataop3 as rescisao
    FROM FCFO
    WHERE FCFO.CODCFO LIKE 'T%'
    ORDER BY FCFO.NOMEFANTASIA ASC;