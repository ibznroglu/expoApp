import { useAuth } from '@/context/AuthContext'
import { Redirect, Slot } from 'expo-router'

export default function AppLayout(){
    const {session} = useAuth()
    return !session ? <Redirect  href="/signin"/> : <Slot/>
}