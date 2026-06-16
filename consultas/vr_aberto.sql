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
WHERE (fcfo.nomefantasia LIKE ? OR fcfo.cgccfo LIKE ?)
  AND flan.statuslan = 'A'
  AND flan.codtdo <> 'PRE'