SELECT 
    flan.numerodocumento, 
    fcfo.nomefantasia, 
    flan.valororiginal, 
    flan.statuslan,
    flan.datavencimento,
    flan.databaixa, 
    flan.historico 
FROM flan
LEFT JOIN fcfo ON flan.codcfo = fcfo.codcfo 
WHERE (upper(fcfo.nomefantasia) LIKE ? OR upper(fcfo.cgccfo) LIKE ? OR upper(fcfo.cgccfo) LIKE ?)
  AND flan.statuslan = 'A'
  AND flan.codtdo <> 'PRE'