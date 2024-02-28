import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dialog from "react-native-dialog"

type Group = {
    _id: string;
    _creationTime: number;
    description: string;
    icon_url: string;
    name: string;
}

const Page = () => {

    const groups = useQuery(api.groups.get) || []
    const [name,setName] = useState("")
    const [visible,setVisible] = useState(false)
    

    useEffect(() => {
        const loadUser = async () => {
            // AsyncStorage.clear()
            const user = await AsyncStorage.getItem("user")
            // console.log("User", user)
            if (!user) {
                setTimeout(() => {
                    setVisible(true)

                }, 100);
            }else{
                setName(user)
            }
        }
        loadUser()
    },[])

    const setUser = async() => {
        let r = (Math.random() + 1).toString(36).substring(7)
        const userName = `${name}#${r}`
        await AsyncStorage.setItem("user",userName)
        setName(userName)
        setVisible(false)
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {groups.map((group: Group) => (
                   <Link href={{ pathname: `/(chat)/[chatid]`, params: { chatid: group._id } }} key={group._id.toString()} asChild>
                    <Pressable style={styles.group}> 
                        <Image source={{ uri: group.icon_url }} style={styles.image}/>
                        <View>
                            <Text>{group.name}</Text>
                            <Text style={styles.description}>{group.description}</Text>
                        </View>
                    </Pressable>
               </Link>
                ))}
            </ScrollView>
            <Dialog.Container visible={visible}>
                <Dialog.Title>UserName required</Dialog.Title>
                <Dialog.Description>please insert a name to start chatting</Dialog.Description>
                <Dialog.Input onChangeText={setName}/>
                <Dialog.Button label="Set name" onPress={setUser}/>
            </Dialog.Container>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#F8F5EA"
    },
    group:{
        flexDirection: "row",
        gap: 10,
        alignItems:"center",
        backgroundColor:"#fff",
        padding:10,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset:{
            width: 0,
            height: 1
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22
    },
    image:{
        width: 50,
        height: 50,
        padding: 3,
        borderRadius: 30,
    },
    description:{
        color:"#888"
    }
})

export default Page;
