import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import {  useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

type Group = {
    _id: string;
    _creationTime: number;
    description: string;
    icon_url: string;
    name: string;
}

const Page = () => {

    const groups = useQuery(api.groups.get) || []

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                {groups.map((group: Group) => (
                    <View key={group._id}>
                        <Text>{group.name}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

export default Page;
