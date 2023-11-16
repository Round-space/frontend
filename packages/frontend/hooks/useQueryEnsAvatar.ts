import { fetchEnsAvatar } from "@wagmi/core";
import { useQuery } from "react-query";

export function useQueryEnsAvatar(address) {
    const { data } = useQuery(['fetchEnsAvatar', address], async ({ queryKey }) => {
        if( !queryKey[1]  ) return null;
        try {
            const res =  await fetchEnsAvatar({
                addressOrName: queryKey[1]
            })
            console.log('fetchEnsAvatar', res)
            return res;
        } catch (e) {
            console.log('fetchEnsAvatar error', e.message)
            return null;
        }
    }, {
        staleTime: 1000 * 60 * 5,
    })

    return data;
}