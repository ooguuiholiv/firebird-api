select flan.numerodocumento, fcfo.nomefantasia,flan.valororiginal, flan.statuslan, flan.historico from flan
left join fcfo on flan.codcfo = fcfo.codcfo 
where numerodocumento = ?
and statuslan <> 'C'