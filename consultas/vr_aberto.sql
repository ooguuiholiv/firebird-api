SELECT 
    flan.numerodocumento, 
    fcfo.nomefantasia, 
    flan.valororiginal, 
    flan.statuslan, 
    flan.historico 
FROM flan
LEFT JOIN fcfo ON flan.codcfo = fcfo.codcfo 
WHERE fcfo.nomefantasia LIKE '%' + ? + '%'
  AND flan.statuslan = 'A'