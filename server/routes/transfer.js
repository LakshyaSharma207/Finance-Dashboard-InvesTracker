// routes/investments.js
const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../detabase.js');
const mysql = require('mysql');

router.post('/transfer', (req, res) => {
    const userId = req.session.userId;
    const assetName = req.body.assetName;

    db.getConnection(async (err, connection) => { 
        if (err) throw (err)
        
        const sqlSearch = "SELECT amount FROM transaction WHERE userId = ? && name = ?;"
        const search_query = mysql.format(sqlSearch, [userId, assetName])

        await connection.query (search_query, async (err, result) => {
            connection.release();
            if (err) throw (err);

            if (result.length != 0) {
                const assetValue = result[0].amount;
                const walletsearch = "SELECT wallet_id from wallet WHERE userId = ?;";
                const wallet_query = mysql.format(walletsearch, [userId]);
                await connection.query (wallet_query, async (err, wallet) => {
                    const walletId = wallet[0].wallet_id;
                    const sqlUpdate = "UPDATE wallet SET amount = amount + ? WHERE wallet_id = ?;";
                    const update_query = mysql.format(sqlUpdate, [assetValue, walletId]);
                    await connection.query (update_query, async (err, update) => {
                        if (err) throw (err);
    
                        const sqlDelete = "DELETE from transaction WHERE userId = ? && name = ?;";
                        const delete_query = mysql.format(sqlDelete, [userId, assetName]);
                        await connection.query (delete_query, (err, result) => {
                            if (err) throw (err);
    
                            res.send({ success: true })
                        });
                    })
                });
            } else {
                res.status(400).send({ error: 'User or transaction not found' })
            }
        });
    });
})

module.exports = router;
