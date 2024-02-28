import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ListRenderItem, FlatList, Keyboard } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useConvex, useMutation, useQuery } from "convex/react"
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { Ionicons } from '@expo/vector-icons';

const Page = () => {
    const { chatid } = useLocalSearchParams()
    const [user, setUser] = useState<string | null>(null)
    const [newMessage, setNewMessage] = useState("")
    const convex = useConvex()
    const navigation = useNavigation()
    const addMessage = useMutation(api.messages.sendMessage)
    const messages = useQuery(api.messages.get, { chatId: chatid as Id<"groups"> }) || []
    const listRef = useRef<FlatList>(null)

    useEffect(() => {
        const loadGroup = async () => {
            const groupInfo = await convex.query(api.groups.getGroup, { id: chatid as Id<"groups"> })
            // console.log("groupInfo" , groupInfo)
            navigation.setOptions({ headerTitle: groupInfo?.name })
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
           listRef.current?.scrollToEnd({animated: true}) 
        }, 300);
    }, [messages])

    const handleSendMessage = () => {
        Keyboard.dismiss()
        addMessage({
            group_id: chatid as Id<"groups">,
            content: newMessage,
            user: user || "Anon"
        })
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
                <Text style={styles.timestamp}>
                    {new Date(item._creationTime).toLocaleTimeString()} - {item.user}
                </Text>
            </View>
        )
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={100}>
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item._id.toString()}
                />


                <View style={styles.inputcontainer}>
                    <View style={{ flexDirection: "row" }}>
                        <TextInput
                            style={styles.textInput}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            placeholder='Type your message'
                            multiline={true}
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={newMessage === ""}>
                            <Ionicons name="send-outline" style={styles.sendButtontext} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
    }
})

export default Page;