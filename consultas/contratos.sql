SELECT DISTINCT
      tmov.numeromov as contrato,
      tmov.segundonumero as NS,
      tmov.campolivre1 as plano,
      tmov.serie,
      fcfo.nomefantasia AS CLIENTE,
      fcfo.cgccfo as CNPJ_CLIENTE
    FROM TMOV
    LEFT JOIN FCFO ON TMOV.CODCFO = FCFO.CODCFO
    WHERE TMOV.CODTMV = '2.2.13'
    AND TMOV.STATUS <> 'C';