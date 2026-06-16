SELECT
      fcfo.nomefantasia as nome_completo,
      fcfo.cgccfo as cpf_cnpj
    FROM FCFO
    WHERE FCFO.CGCCFO = ?