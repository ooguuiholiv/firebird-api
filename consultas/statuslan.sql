select flan.numerodocumento, fcfo.nomefantasia, flan.valororiginal, flan.statuslan, flan.historico, flan.databaixa, flan.datavencimento from flan
left join fcfo on flan.codcfo = fcfo.codcfo 
where numerodocumento = ?
and (upper(fcfo.nomefantasia) like ? or upper(fcfo.cgccfo) like ? or upper(fcfo.cgccfo) like ?)
and statuslan <> 'C'
and flan.codtdo <> 'PRE'