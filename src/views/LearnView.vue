<script setup>
import { computed, ref } from 'vue'
import { BookOpen, Search, Clock3, ChevronDown, Sparkles } from 'lucide-vue-next'
import { articles } from '../data/articles'
const search = ref('')
const category = ref('All topics')
const expanded = ref(null)
const categories = ['All topics', ...new Set(articles.map(a => a.category))]
const filtered = computed(() => articles.filter(a => (category.value === 'All topics' || a.category === category.value) && `${a.title} ${a.intro} ${a.body} ${a.category}`.toLowerCase().includes(search.value.toLowerCase())))
</script>
<template>
  <div class="page-stack">
    <section class="learn-hero"><div class="learn-hero-copy"><p class="eyebrow"><Sparkles :size="13" /> YOUR CYCLE, EXPLAINED</p><h1>A little more knowledge.<br /><span>A little more care.</span></h1><p>Gentle, practical guides to help you understand cycle basics and look after yourself.</p></div><div class="learn-hero-art"><div class="book-orbit orbit-one"></div><div class="book-orbit orbit-two"></div><div class="book-stack"><BookOpen :size="52" stroke-width="1.2" /></div><span class="learn-star star-one">✦</span><span class="learn-star star-two">✿</span></div></section>
    <section class="learn-toolbar"><div class="search-field learn-search"><Search :size="17" /><input v-model="search" placeholder="Search cycle topics…" aria-label="Search learning articles" /></div><select v-model="category" aria-label="Filter article category"><option v-for="item in categories" :key="item">{{ item }}</option></select></section>
    <div class="article-grid"><article v-for="article in filtered" :key="article.id" class="article-card"><div class="article-topline"><span class="article-category">{{ article.category }}</span><span class="read-time"><Clock3 :size="13" />{{ article.read }}</span></div><div class="article-art" :class="'article-art-'+article.id"><span>{{ ['✿','♡','☼','◌','✧','❋'][article.id-1] }}</span></div><h2>{{ article.title }}</h2><p class="article-intro">{{ article.intro }}</p><button class="article-expand" @click="expanded = expanded === article.id ? null : article.id">{{ expanded === article.id ? 'Show less' : 'Read guide' }} <ChevronDown :size="16" :class="{ rotate: expanded === article.id }" /></button><div v-if="expanded === article.id" class="article-body">{{ article.body }}</div></article></div>
    <div v-if="!filtered.length" class="empty-state"><strong>No guides match that search</strong><p>Try a different keyword or topic.</p><button class="btn btn-secondary" @click="search = ''; category = 'All topics'">Clear filters</button></div>
    <div class="medical-note">These short guides are general educational content and are not a diagnosis or a substitute for professional medical advice.</div>
  </div>
</template>
