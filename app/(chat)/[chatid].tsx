import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TextInput, Pressable, ListRenderItem, FlatList, Keyboard, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConvex, useMutation, useQuery } from "convex/react"
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const Page = () => {
    const { chatid } = useLocalSearchParams()
    const [user, setUser] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const [selectedImage, setSelectdImage] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const convex = useConvex()
    const navigation = useNavigation()
    const addMessage = useMutation(api.messages.sendMessage)
    const messages = useQuery(api.messages.get, { chatId: chatid as Id<"groups"> }) || []
    const listRef = useRef<FlatList>(null)

    useEffect(() => {
        const loadGroup = async () => {
            const groupInfo = await convex.query(api.groups.getGroup, { id: chatid as Id<"groups"> })
            // console.log("groupInfo" , groupInfo)
            navigation.setOptions({
                headerTitle: groupInfo?.name,
                headerTitleStyle: { flexDirection: 'row', alignItems: 'center' },
                headerTitleAlign: 'left',
                headerLeft: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" color={"#fff"} size={22} />
                        </Pressable>
                        <Image
                            source={{ uri: groupInfo?.icon_url }}
                            style={styles.headerImage}
                        />
                    </View>
                ),
            })
        }
        loadGroup()
    }, [chatid])

    useEffect(() => {
        const loadUser = async () => {
            const user = await AsyncStorage.getItem("user")
            setUser(user)
        }
        loadUser()
    }, [])

    useEffect(() => {
        setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true })
        }, 500);
    }, [messages])

    const handleSendMessage = async () => {
        Keyboard.dismiss()
        if (selectedImage) {
            setUploading(true)
            const url = `${process.env.EXPO_PUBLIC_CONVEX_SITE}/sendImage?user=${encodeURIComponent(user!)}&group_id=${chatid}&content=${encodeURIComponent(newMessage)}`

            const response = await fetch(selectedImage)
            const blob = await response.blob()

            fetch(url,{
                method:"POST",
                headers:{"Content-Type": blob.type!},
                body:blob
            }).then(()=>{
                setSelectdImage(null)
                setNewMessage("")
            }).catch((err)=> console.log(err))
            .finally(() => setUploading(false))

        } else {
            addMessage({
                group_id: chatid as Id<"groups">,
                content: newMessage,
                user: user || "Anon"
            })
        }
        setNewMessage("")
    }

    const renderMessage: ListRenderItem<Doc<"messages">> = ({ item }) => {
        const isUserMessage = item.user === user

        return (
            <View style={[styles.messagecontainer, isUserMessage ? styles.userMessagecontainer : styles.otherMessageContainer]}>
                {item.content !== "" && <Text style={
                    [styles.messageText, isUserMessage
                        ? styles.userMessageText
                        : styles.otherMessageText]}>
                    {item.content}
                </Text>
                }
                {item.file && <Image source={{ uri:item.file }} style={{ width:200,height:200,margin:10 }}/>}
                <Text style={styles.timestamp}>
                    {new Date(item._creationTime).toLocaleTimeString()} - {item.user}
                </Text>
            </View>
        )
    }

    const captureImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1
        })
        if (!result.canceled) {
            const uri = result.assets[0].uri
            setSelectdImage(uri)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item._id.toString()}
                    ListFooterComponent={<View style={{ padding: 5 }} />}
                    ref={listRef}
                />


                <View style={styles.inputcontainer}>
                    {selectedImage && <Image source={{ uri: selectedImage }} style={{ width: 200, height: 200, margin: 10 }} />}
                    <View style={{ flexDirection: "row" }}>
                        <TextInput
                            style={styles.textInput}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder='Type your message'
                            multiline={true}
                            keyboardType="default"
                        />
                        <Pressable style={styles.sendButton} onPress={captureImage} android_ripple={{ color: "#ffffff81" }}>
                            <Ionicons name="camera-outline" style={styles.sendButtontext} />
                        </Pressable>
                        <Pressable style={styles.sendButton} onPress={handleSendMessage} disabled={newMessage === ""} android_ripple={{ color: "#ffffff81" }}>
                            <Ionicons name="send-outline" style={styles.sendButtontext} />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {uploading && (
                <View style={[StyleSheet.absoluteFill,{
                    backgroundColor:"rgba(0,0,0,0.4)",
                    alignItems:"center",
                    justifyContent:"center"
                }]}>
                    <ActivityIndicator color={"#fff"} animating size={"large"}/>
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F5EA"
    },
    inputcontainer: {
        padding: 10,
        backgroundColor: "#fff",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            height: 0,
            width: -8
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 5,
        paddingHorizontal: 10,
        minHeight: 40,
        backgroundColor: "#FFF",
    },
    sendButton: {
        backgroundColor: "#EEA217",
        borderRadius: 5,
        padding: 10,
        marginLeft: 10,
        alignSelf: "flex-end",
    },
    sendButtontext: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold"
    },
    messagecontainer: {
        padding: 10,
        borderRadius: 10,
        marginTop: 10,
        marginHorizontal: 10,
        maxWidth: "80%"
    },
    userMessagecontainer: {
        backgroundColor: "#791363",
        alignSelf: "flex-end",
    },
    otherMessageContainer: {
        alignSelf: "flex-start",
        backgroundColor: "#EEA217",
    },
    messageText: {
        fontSize: 16,
        flexWrap: "wrap",
    },
    userMessageText: {
        color: "#fff"
    },
    otherMessageText: {
        color: "#fff"
    },
    timestamp: {
        fontSize: 12,
        color: "#fff"
    },
    headerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 5,
        marginLeft: 10
    }
})

export default Page;