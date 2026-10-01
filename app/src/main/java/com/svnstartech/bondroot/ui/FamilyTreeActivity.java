package com.svnstartech.bondroot.ui;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.android.material.card.MaterialCardView;
import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;
import com.svnstartech.bondroot.util.LanguageManager;

import java.util.*;

public class FamilyTreeActivity extends AppCompatActivity {

    private LinearLayout layoutTreeContainer;
    private PersonRepository repository;
    private List<Person> allPersons;
    private Set<String> highlightedPersonIds = new HashSet<>();

    @Override
    protected void attachBaseContext(Context newBase) {
        super.attachBaseContext(LanguageManager.applyLocale(newBase));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_family_tree);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(getString(R.string.title_family_tree));
            toolbar.setNavigationOnClickListener(v -> finish());
        }

        layoutTreeContainer = findViewById(R.id.layoutTreeContainer);
        repository = PersonRepository.getInstance(this);
        allPersons = repository.getAllPersons();

        ArrayList<String> extraHighlights = getIntent().getStringArrayListExtra("highlight_ids");
        if (extraHighlights != null) {
            highlightedPersonIds.addAll(extraHighlights);
        }

        renderFamilyTree();
    }

    private void renderFamilyTree() {
        layoutTreeContainer.removeAllViews();
        boolean isEnglish = LanguageManager.isEnglish(this);

        // Group persons by generation using topological / parent depth
        Map<String, Integer> depthMap = new HashMap<>();
        Map<String, Person> personMap = new HashMap<>();
        for (Person p : allPersons) {
            personMap.put(p.getPersonId(), p);
        }

        // Roots (persons with no father) have depth 0
        for (Person p : allPersons) {
            if (p.getFatherId() == null || p.getFatherId().isEmpty()) {
                depthMap.put(p.getPersonId(), 0);
            }
        }

        // Propagate depth
        boolean changed = true;
        int maxIter = 10;
        while (changed && maxIter-- > 0) {
            changed = false;
            for (Person p : allPersons) {
                if (p.getFatherId() != null && depthMap.containsKey(p.getFatherId())) {
                    int parentDepth = depthMap.get(p.getFatherId());
                    int expected = parentDepth + 1;
                    if (!depthMap.containsKey(p.getPersonId()) || depthMap.get(p.getPersonId()) != expected) {
                        depthMap.put(p.getPersonId(), expected);
                        changed = true;
                    }
                }
            }
        }

        // Group into generations
        Map<Integer, List<Person>> generations = new TreeMap<>();
        for (Person p : allPersons) {
            int d = depthMap.getOrDefault(p.getPersonId(), 0);
            generations.computeIfAbsent(d, k -> new ArrayList<>()).add(p);
        }

        // Render each generation
        for (Map.Entry<Integer, List<Person>> entry : generations.entrySet()) {
            int gen = entry.getKey();
            List<Person> list = entry.getValue();

            // Generation Header
            TextView header = new TextView(this);
            String title = (gen == 0) ? getString(R.string.gen_1_title) :
                    (gen == 1) ? getString(R.string.gen_2_title) :
                    (gen == 2) ? getString(R.string.gen_3_title) :
                            getString(R.string.gen_4_title);

            header.setText(title);
            header.setTextSize(14);
            header.setTypeface(null, android.graphics.Typeface.BOLD);
            header.setTextColor(getResources().getColor(R.color.primary, null));
            header.setPadding(4, 16, 4, 8);
            layoutTreeContainer.addView(header);

            for (Person p : list) {
                boolean isHighlighted = highlightedPersonIds.contains(p.getPersonId());

                MaterialCardView card = new MaterialCardView(this);
                card.setCardElevation(isHighlighted ? 4 : 2);
                card.setRadius(14);
                card.setStrokeColor(isHighlighted ? Color.parseColor("#F57F17") : getResources().getColor(R.color.divider, null));
                card.setStrokeWidth(isHighlighted ? 2 : 1);
                card.setCardBackgroundColor(isHighlighted ? Color.parseColor("#FFF9C4") : Color.WHITE);

                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                lp.setMargins(0, 0, 0, 12);
                card.setLayoutParams(lp);

                LinearLayout inner = new LinearLayout(this);
                inner.setOrientation(LinearLayout.VERTICAL);
                inner.setPadding(16, 14, 16, 14);

                if (isHighlighted) {
                    TextView tvBadge = new TextView(this);
                    tvBadge.setText("★ " + (isEnglish ? "In Relationship Path" : "অনুসন্ধানকৃত সম্পর্কের সংযুক্ত সদস্য"));
                    tvBadge.setTextSize(11);
                    tvBadge.setTypeface(null, android.graphics.Typeface.BOLD);
                    tvBadge.setTextColor(Color.parseColor("#E65100"));
                    tvBadge.setPadding(0, 0, 0, 4);
                    inner.addView(tvBadge);
                }

                TextView tvName = new TextView(this);
                tvName.setText(p.getDisplayName(isEnglish));
                tvName.setTextSize(16);
                tvName.setTypeface(null, android.graphics.Typeface.BOLD);
                tvName.setTextColor(getResources().getColor(R.color.text_primary, null));
                inner.addView(tvName);

                TextView tvSub = new TextView(this);
                String fatherName = isEnglish ? "Root Ancestor / None" : "মূল পূর্বপুরুষ (Root)";
                if (p.getFatherId() != null && personMap.containsKey(p.getFatherId())) {
                    fatherName = personMap.get(p.getFatherId()).getDisplayName(isEnglish);
                }
                String fatherLabel = isEnglish ? "Father" : "পিতা";
                String birthLabel = isEnglish ? "Birth" : "জন্ম";
                String dob = p.getDateOfBirth() != null ? p.getDateOfBirth() : (isEnglish ? "Unknown" : "অজানা");

                tvSub.setText("Person ID: " + p.getPersonId() + " • " + fatherLabel + ": " + fatherName + " • " + birthLabel + ": " + dob);
                tvSub.setTextSize(12);
                tvSub.setTextColor(getResources().getColor(R.color.text_secondary, null));
                tvSub.setPadding(0, 4, 0, 8);
                inner.addView(tvSub);

                // Quick Action: Tap to view profile
                TextView tvViewProf = new TextView(this);
                tvViewProf.setText(isEnglish ? "👤 View Profile" : "👤 বিস্তারিত প্রোফাইল দেখুন");
                tvViewProf.setTextSize(12);
                tvViewProf.setTypeface(null, android.graphics.Typeface.BOLD);
                tvViewProf.setTextColor(getResources().getColor(R.color.primary, null));
                inner.addView(tvViewProf);

                card.setOnClickListener(v -> {
                    Intent intent = new Intent(FamilyTreeActivity.this, PersonProfileActivity.class);
                    intent.putExtra("person_id", p.getPersonId());
                    startActivity(intent);
                });

                card.addView(inner);
                layoutTreeContainer.addView(card);
            }
        }
    }
}
