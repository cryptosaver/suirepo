// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import {
    SUI_TYPE_ARG,
    SuiTransactionBlockResponse,
    getTotalGasUsed,
    getTransactionSender,
} from '@mysten/sui.js';
import { useMemo } from 'react';

export function useGetTransferAmount(
    txnData: SuiTransactionBlockResponse,
    currentAddress?: string
) {
    const { balanceChanges } = txnData;
    const sender = getTransactionSender(txnData);
    const gas = BigInt(getTotalGasUsed(txnData) ?? 0n);
    const changes = useMemo(
        () =>
            balanceChanges
                ? balanceChanges?.map(({ coinType, amount, owner }) => ({
                      coinType,
                      address:
                          owner === 'Immutable'
                              ? 'Immutable'
                              : 'AddressOwner' in owner
                              ? owner.AddressOwner
                              : 'ObjectOwner' in owner
                              ? owner.ObjectOwner
                              : '',
                      amount:
                          BigInt(amount) < 0n
                              ? -(BigInt(amount) + gas)
                              : BigInt(amount),
                  }))
                : [],
        [balanceChanges, gas]
    );

    // if we have an address, find the change for that address to get the amount
    // otherwise, use the first change
    // todo: selecting the first balance change isn't really correct, we should fix this
    const change = currentAddress
        ? changes?.find(({ address }) => address === currentAddress)
        : changes?.[0];

    return {
        balanceChanges: currentAddress && change ? [change] : changes,
        coinType: change?.coinType || SUI_TYPE_ARG,
        gas,
        sender,
        amount: change?.amount ?? 0n,
    };
}
