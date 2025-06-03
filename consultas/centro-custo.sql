WITH Preferido_CentroCusto AS (
    SELECT
        flan.idlan,
        COALESCE(frc.ccusto, fe.ccusto, flan.ccusto) AS ccusto_tratado,
        frc.ccusto AS rateio_de_cc,

        CASE 
            WHEN flan.historico CONTAINING 'BAIXA PARCIAL' THEN flan.valorbaixado
            WHEN  FLAN.HISTORICO CONTAINING 'IMP_RET' THEN flan.valorbaixado
            ELSE frc.valor
        END AS valor_cc,

        flan.ccusto AS cc,
        fe.ccusto AS cc_extrato
    FROM flan
    LEFT JOIN (
        SELECT idlan, ccusto, valor
        FROM flanratccusto
        WHERE origem = 'L'
    ) frc ON frc.idlan = flan.idlan
    LEFT JOIN (
        SELECT numerodocumento, cnpjcpf, ccusto
        FROM fextrato
    ) fe ON fe.numerodocumento = 
                CASE 
                    WHEN flan.statuslan = 'B' THEN flan.numerodocumento || '/' || COALESCE(CAST(flan.parcela AS VARCHAR(10)), '')
                    ELSE flan.numerodocumento
                END
            AND fe.cnpjcpf = flan.codcfo
)
SELECT 
    flan.datavencimento, 
    flan.databaixa,
    CASE 
        WHEN flan.statuslan = 'B' THEN flan.numerodocumento || '/' || COALESCE(CAST(flan.parcela AS VARCHAR(10)), '')
        ELSE flan.numerodocumento
    END AS numerodocumento, 
    flan.parcela,
    fcfo.nomefantasia,
    fcfo.cgccfo AS CNPJ_CPF, 
    flan.valororiginal,
    flan.valorbaixado,

    p.rateio_de_cc AS Rateio_de_CC,
    p.valor_cc AS VALOR_CC,
    p.cc AS CC,
    p.cc_extrato AS CC_extrato,
    p.ccusto_tratado AS CC_tratado,

    CASE 
        WHEN flan.pagrec = 'P' THEN 'PAGAR'
        WHEN flan.pagrec = 'R' THEN 'RECEBER'
        ELSE 'DESCONHECIDO' 
    END AS Tipo_Transacao,

    fccusto.descricao AS Descricao_Centro_Custo,
    flan.statuslan AS Status_do_lancamento,
    flan.historico

FROM flan
LEFT JOIN fcfo ON fcfo.codcfo = flan.codcfo
LEFT JOIN Preferido_CentroCusto p ON p.idlan = flan.idlan
LEFT JOIN fccusto ON fccusto.cod = p.ccusto_tratado;